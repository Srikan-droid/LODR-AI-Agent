import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegulations } from '../context/RegulationsContext';
import './AddRegulationChatbot.css';

// JSE regulation template when user enters "Johannesburg Stock Exchange (JSE)"
const createJSERegulation = () => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  return {
    title: 'Johannesburg Stock Exchange (JSE) Listing Requirements',
    category: 'Stock Exchange',
    description: 'Listing obligations and disclosure requirements for entities listed on the Johannesburg Stock Exchange. Covers listing rules, continuing obligations, and corporate actions for South African listed companies.',
    date: dateStr,
    lastAmended: dateStr,
    keywords: ['jse', 'johannesburg', 'listing', 'south africa', 'stock exchange', 'disclosure'],
    events: [],
  };
};

// Domain summary text shown in popup and in Dividends Summary tab
const DOMAIN_SUMMARY_TEXT = `Dividends under JSE Listing Requirements

This domain covers disclosure and procedural requirements for dividend declarations and distributions by listed entities on the Johannesburg Stock Exchange.

Key areas include:
• Declaration and announcement timelines for dividend decisions
• Disclosure of dividend policy and historical payouts in annual reports
• Communication to shareholders and settlement procedures
• Interaction with JSE Listings Requirements and the Companies Act`;

// Helper to get random severity
const getRandomSeverity = () => {
  const severities = ['high', 'medium', 'low'];
  return severities[Math.floor(Math.random() * severities.length)];
};

// Helper to get random score (1-5)
const getRandomScore = () => Math.floor(Math.random() * 5) + 1;

// Obligations table data for Dividends (same structure as Credit Ratings)
const DIVIDENDS_OBLIGATIONS_DATA = [
  { id: 1, typeOfEntity: 'Listed entity (wherever applicable)', regulation: 'Regulation 8', requirement: 'General Obligation / Cooperation', text: 'The listed entity shall co-operate with and submit correct and adequate information to intermediaries registered with the Board, such as credit rating agencies, within specified timelines and procedures.', format: 'N/A', validationCheck: '', penalty: '', source: 'LODR.pdf', severity: getRandomSeverity(), score: getRandomScore(), isSubmitted: false },
  { id: 2, typeOfEntity: 'Listed entity with listed specified securities', regulation: 'Regulation 30 read with Schedule III, Part A, Para A, Clause 3', requirement: 'Event-based disclosure (Deemed Material)', text: 'Disclosure of New Rating(s) or Revision in Rating(s) assigned by a credit rating agency to any debt instrument, fixed deposit programme, or scheme/proposal involving fund mobilization (in India or abroad). Downward revision reasons must be intimated.', format: 'Disclosure to stock exchanges', validationCheck: 'announcement_date - rating_date <= 24H', ruleId: 'CR_01', penalty: '', source: 'LODR.pdf', severity: getRandomSeverity(), score: getRandomScore(), isSubmitted: false },
  { id: 3, typeOfEntity: 'Listed entity with listed specified securities', regulation: 'Regulation 46(2)(r)', requirement: 'Website disclosure', text: 'Disclose all credit ratings obtained by the entity for all its outstanding instruments on its functional website.', format: 'Disclosed on the entity website', validationCheck: 'announcement_date - website_date <= 24H', ruleId: 'CR_02', penalty: '', source: 'LODR.pdf', severity: getRandomSeverity(), score: getRandomScore(), isSubmitted: false },
  { id: 4, typeOfEntity: 'Listed entity which has listed non-convertible securities', regulation: 'Regulation 55 (Chapter V)', requirement: 'Review requirement', text: 'Each rating obtained by the listed entity with respect to non-convertible securities shall be reviewed by a credit rating agency registered by the Board.', format: 'N/A', validationCheck: 'announcement_date present in last 12 months', ruleId: 'CR_03', penalty: '', source: 'LODR.pdf', severity: getRandomSeverity(), score: getRandomScore(), isSubmitted: false },
];

// Dividends event template when user queries "Give me details of Dividends"
const createDividendsEvent = () => ({
  name: 'Dividends',
  description: 'Disclosure and requirements related to dividend declarations, distributions, and shareholder payouts under JSE listing requirements.',
  category: 'Corporate Actions',
  keywords: ['dividend', 'distribution', 'payout', 'shareholder', 'declaration'],
  hasTabs: true,
  summaryText: '',
  regulations: [],
});

function AddRegulationChatbot() {
  const navigate = useNavigate();
  const { regulations, addRegulation, addEventToRegulation, removeEvent, updateEventToRegulation } = useRegulations();
  const [chatMessages, setChatMessages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [mandatoryTextField, setMandatoryTextField] = useState('');
  const [regulationDescription, setRegulationDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [domainUploadedFiles, setDomainUploadedFiles] = useState([]);
  const [isDomainDragging, setIsDomainDragging] = useState(false);
  const domainFileInputRef = useRef(null);
  const [progressMessageId, setProgressMessageId] = useState(null);
  const [showDomainSummaryPopup, setShowDomainSummaryPopup] = useState(false);
  const [domainSummaryInfo, setDomainSummaryInfo] = useState(null);
  const [creatingObligationsMessageId, setCreatingObligationsMessageId] = useState(null);
  const [showDomainInput, setShowDomainInput] = useState(false);
  const [isDomainPDFProcessing, setIsDomainPDFProcessing] = useState(false);
  const [isDomainInputAfterPDF, setIsDomainInputAfterPDF] = useState(false);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const questionInputRef = useRef(null);

  const progressSteps = [
    { name: 'Document Processing', id: 'processing' },
    { name: 'Text Extraction', id: 'extraction' },
    { name: 'Regulation Analysis', id: 'analysis' },
    { name: 'Knowledge Base Update', id: 'update' },
  ];

  const questionProgressSteps = [
    { name: 'Query Analysis', id: 'query-analysis' },
    { name: 'Knowledge Retrieval', id: 'knowledge-retrieval' },
    { name: 'Response Generation', id: 'response-generation' },
    { name: 'Domain Summary', id: 'domain-summary' },
  ];

  // Progress steps when PDFs are uploaded (skip Document Processing, start from Text Extraction)
  const domainPDFProgressSteps = [
    { name: 'Text Extraction', id: 'extraction' },
    { name: 'Regulation Analysis', id: 'analysis' },
    { name: 'Knowledge Base Update', id: 'update' },
    { name: 'Domain Summary', id: 'domain-summary' },
  ];

  useEffect(() => {
    // Initialize with welcome message on mount
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          type: 'system',
          content: 'Welcome! I\'m here to help you add a new regulation to the knowledge base. Please upload one or more PDF documents containing the regulation details.',
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [uploadedFiles, mandatoryTextField]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFilesSelect(files);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      handleFilesSelect(files);
    }
  };

  const handleFilesSelect = (files) => {
    const pdfFiles = files.filter(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfFiles.length === 0) {
      setChatMessages((prev) => [
        ...prev,
        {
          type: 'system',
          content: 'Please upload PDF files only.',
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const newFiles = pdfFiles.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    
    const fileNames = pdfFiles.map(f => f.name).join(', ');
    setChatMessages((prev) => [
      ...prev,
      {
        type: 'system',
        content: `Successfully uploaded ${pdfFiles.length} file(s): ${fileNames}`,
        timestamp: new Date(),
      },
    ]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId) => {
    const removedFile = uploadedFiles.find(f => f.id === fileId);
    setUploadedFiles((prev) => prev.filter(f => f.id !== fileId));
    setChatMessages((prev) => [
      ...prev,
      {
        type: 'system',
        content: `Removed file: ${removedFile.name}`,
        timestamp: new Date(),
      },
    ]);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mandatoryTextField.trim() || uploadedFiles.length === 0) {
      return;
    }

    setIsSubmitting(true);
    
    // Add user message
    setChatMessages((prev) => [
      ...prev,
      {
        type: 'user',
        content: `Submit regulation "${mandatoryTextField}" with ${uploadedFiles.length} file(s)`,
        timestamp: new Date(),
      },
    ]);

    // Create progress message
    const newProgressMessageId = `progress-${Date.now()}`;
    setProgressMessageId(newProgressMessageId);
    const fileNames = uploadedFiles.map(f => f.name).join(', ');
    const initialContent = `Regulation Name: ${mandatoryTextField}\nFiles: ${fileNames}\nProgress: 0%\n\n${progressSteps.map((s) => `    ${s.name}`).join('\n')}`;
    
    setChatMessages((prev) => [
      ...prev,
      {
        id: newProgressMessageId,
        type: 'system',
        content: initialContent,
        timestamp: new Date(),
        isProgress: true,
        progressSteps: progressSteps.map((step) => ({ ...step, status: 'pending' })),
        regulationInfo: {
          name: mandatoryTextField,
          files: uploadedFiles.map(f => f.name),
        },
        progressPercentage: 0,
      },
    ]);

    // Progress steps - 4 steps, 1 second each
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      stepIndex++;
      const percentage = Math.round((stepIndex / progressSteps.length) * 100);

      // Update the progress message with current step
      setChatMessages((prev) => {
        return prev.map((msg) => {
          if (msg.id === newProgressMessageId && msg.isProgress) {
            // Create new progressSteps array with updated status
            const updatedSteps = msg.progressSteps.map((s, idx) => {
              if (idx === stepIndex - 1) {
                return { ...s, status: 'processing' };
              }
              return s;
            });
            // Build content string with regulation info and steps
            const stepsContent = updatedSteps
              .map((s) => {
                if (s.status === 'processing') return `    ${s.name}...`;
                if (s.status === 'done') return `    ${s.name} DONE`;
                return `    ${s.name}`;
              })
              .join('\n');
            const content = `Regulation Name: ${msg.regulationInfo.name}\nFiles: ${msg.regulationInfo.files.join(', ')}\nProgress: ${percentage}%\n\n${stepsContent}`;
            return {
              ...msg,
              progressSteps: updatedSteps,
              content,
              progressPercentage: percentage,
            };
          }
          return msg;
        });
      });

      // After a brief delay, mark step as done
      setTimeout(() => {
        setChatMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === newProgressMessageId && msg.isProgress) {
              // Create new progressSteps array with updated status
              const updatedSteps = msg.progressSteps.map((s, idx) => {
                if (idx === stepIndex - 1) {
                  return { ...s, status: 'done' };
                }
                return s;
              });
              // Build content string with regulation info and steps
              const stepsContent = updatedSteps
                .map((s) => {
                  if (s.status === 'processing') return `    ${s.name}...`;
                  if (s.status === 'done') return `    ${s.name} DONE`;
                  return `    ${s.name}`;
                })
                .join('\n');
              const currentPercentage = Math.round((stepIndex / progressSteps.length) * 100);
              const content = `Regulation Name: ${msg.regulationInfo.name}\nFiles: ${msg.regulationInfo.files.join(', ')}\nProgress: ${currentPercentage}%\n\n${stepsContent}`;
              return {
                ...msg,
                progressSteps: updatedSteps,
                content,
                progressPercentage: currentPercentage,
              };
            }
            return msg;
          });
        });
      }, 800);

      if (stepIndex >= progressSteps.length) {
        clearInterval(stepInterval);
        setIsSubmitting(false);
        setProcessingComplete(true);
        
        // Add completion message with View Navigator link
        setTimeout(() => {
          setChatMessages((prev) => {
            return prev.map((msg) => {
              if (msg.id === newProgressMessageId && msg.isProgress) {
                const stepsContent = msg.progressSteps
                  .map((s) => `    ${s.name} DONE`)
                  .join('\n');
                const content = `Regulation Name: ${msg.regulationInfo.name}\nFiles: ${msg.regulationInfo.files.join(', ')}\nProgress: 100%\n\n${stepsContent}\n    Regulation added successfully DONE\n    View Mindmap`;
                return {
                  ...msg,
                  content,
                  progressPercentage: 100,
                  viewMindmapPath: '/rkb?view=directory',
                };
              }
              return msg;
            });
          });
          
          // Add JSE regulation tile when user entered "Johannesburg Stock Exchange (JSE)"
          const regName = mandatoryTextField.trim();
          if (regName && (regName.toLowerCase().includes('johannesburg stock exchange') || regName.toLowerCase().includes('jse'))) {
            addRegulation(createJSERegulation());
          }

          // Add success message
          setTimeout(() => {
            setChatMessages((prev) => [
              ...prev,
              {
                type: 'system',
                content: `Regulation "${mandatoryTextField}" has been successfully added to the knowledge base!`,
                timestamp: new Date(),
              },
            ]);
          }, 500);
        }, 800);
      }
    }, 1000);
  };


  const handleBack = () => {
    navigate('/rkb?view=directory');
  };

  const generateDummyAnswer = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('regulation') || lowerQuestion.includes('add') || lowerQuestion.includes('create')) {
      return 'I can help you with regulations. You can search for existing regulations in the Knowledge Center or ask me questions about specific regulations.';
    }
    if (lowerQuestion.includes('search') || lowerQuestion.includes('find')) {
      return 'You can use the Knowledge Center to search for regulations by keyword, title, or category. Click on "Browse All Regulations" to see all available regulations.';
    }
    if (lowerQuestion.includes('help') || lowerQuestion.includes('how')) {
      return 'I can help you:\n\n1. Answer questions about regulations\n2. Guide you on how to use the Knowledge Center\n3. Provide information about specific regulation requirements\n\nWhat would you like to know?';
    }
    
    return 'Thank you for your question. I\'m here to help you with regulations and the knowledge base. Feel free to ask me anything about regulations or how to navigate the system.';
  };

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (!questionInput.trim()) return;

    const domainName = questionInput.trim();
    const question = `Give me details of ${domainName}`;
    const hasUploadedPDFs = domainUploadedFiles.length > 0;
    
    // Check if this is after PDF processing
    const isAfterPDF = isDomainInputAfterPDF;
    
    // Reset the flag and hide domain input after submission
    setIsDomainInputAfterPDF(false);
    setShowDomainInput(false);
    
    setChatMessages((prev) => [
      ...prev,
      {
        type: 'user',
        content: question + (hasUploadedPDFs ? ` with ${domainUploadedFiles.length} additional PDF(s)` : ''),
        timestamp: new Date(),
      },
    ]);

    // If PDFs are uploaded, start from step 2 (skip Document Processing/Query Analysis)
    const stepsToUse = hasUploadedPDFs 
      ? domainPDFProgressSteps // Use domain PDF progress steps (starts from Text Extraction)
      : questionProgressSteps;
    
    const pdfFileNames = hasUploadedPDFs ? domainUploadedFiles.map(f => f.name).join(', ') : '';
    const initialContent = hasUploadedPDFs
      ? `Query: ${question}\nAdditional PDFs: ${pdfFileNames}\nProgress: 0%\n\n${stepsToUse.map((s) => `    ${s.name}`).join('\n')}`
      : `Query: ${question}\nProgress: 0%\n\n${stepsToUse.map((s) => `    ${s.name}`).join('\n')}`;
    
    // Create progress message for question processing
    const newProgressMessageId = `question-progress-${Date.now()}`;
    setProgressMessageId(newProgressMessageId);
    
    setChatMessages((prev) => [
      ...prev,
      {
        id: newProgressMessageId,
        type: 'system',
        content: initialContent,
        timestamp: new Date(),
        isProgress: true,
        progressSteps: stepsToUse.map((step) => ({ ...step, status: 'pending' })),
        questionInfo: {
          query: question,
          domainName: domainName,
          hasPDFs: hasUploadedPDFs,
          pdfFiles: pdfFileNames,
          isAfterPDFProcessing: isAfterPDF,
        },
        progressPercentage: 0,
      },
    ]);

    // Progress steps - adjust based on whether PDFs were uploaded
    let stepIndex = 0;
    const totalSteps = stepsToUse.length;
    const stepInterval = setInterval(() => {
      stepIndex++;
      const percentage = Math.round((stepIndex / totalSteps) * 100);

      // Update the progress message with current step
      setChatMessages((prev) => {
        return prev.map((msg) => {
          if (msg.id === newProgressMessageId && msg.isProgress) {
            // Create new progressSteps array with updated status
            const updatedSteps = msg.progressSteps.map((s, idx) => {
              if (idx === stepIndex - 1) {
                return { ...s, status: 'processing' };
              }
              return s;
            });
            // Build content string with question info and steps
            const stepsContent = updatedSteps
              .map((s) => {
                if (s.status === 'processing') return `    ${s.name}...`;
                if (s.status === 'done') return `    ${s.name} DONE`;
                return `    ${s.name}`;
              })
              .join('\n');
            const content = msg.questionInfo.hasPDFs
              ? `Query: ${msg.questionInfo.query}\nAdditional PDFs: ${msg.questionInfo.pdfFiles}\nProgress: ${percentage}%\n\n${stepsContent}`
              : `Query: ${msg.questionInfo.query}\nProgress: ${percentage}%\n\n${stepsContent}`;
            return {
              ...msg,
              progressSteps: updatedSteps,
              content,
              progressPercentage: percentage,
            };
          }
          return msg;
        });
      });

      // After a brief delay, mark step as done
      setTimeout(() => {
        setChatMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === newProgressMessageId && msg.isProgress) {
              // Create new progressSteps array with updated status
              const updatedSteps = msg.progressSteps.map((s, idx) => {
                if (idx === stepIndex - 1) {
                  return { ...s, status: 'done' };
                }
                return s;
              });
              // Build content string with question info and steps
              const stepsContent = updatedSteps
                .map((s) => {
                  if (s.status === 'processing') return `    ${s.name}...`;
                  if (s.status === 'done') return `    ${s.name} DONE`;
                  return `    ${s.name}`;
                })
                .join('\n');
              const currentPercentage = Math.round((stepIndex / totalSteps) * 100);
              const content = msg.questionInfo.hasPDFs
                ? `Query: ${msg.questionInfo.query}\nAdditional PDFs: ${msg.questionInfo.pdfFiles}\nProgress: ${currentPercentage}%\n\n${stepsContent}`
                : `Query: ${msg.questionInfo.query}\nProgress: ${currentPercentage}%\n\n${stepsContent}`;
              return {
                ...msg,
                progressSteps: updatedSteps,
                content,
                progressPercentage: currentPercentage,
              };
            }
            return msg;
          });
        });
      }, 800);

      if (stepIndex >= totalSteps) {
        clearInterval(stepInterval);
        
        // Add completion message with View Domain Summary link
        setTimeout(() => {
          setChatMessages((prev) => {
            return prev.map((msg) => {
              if (msg.id === newProgressMessageId && msg.isProgress) {
                const stepsContent = msg.progressSteps
                  .map((s) => `    ${s.name} DONE`)
                  .join('\n');
                // If this is after PDF processing, don't show View Mindmap again - only View Domain Summary
                const completionContent = msg.questionInfo.isAfterPDFProcessing
                  ? `Query: ${msg.questionInfo.query}\nProgress: 100%\n\n${stepsContent}\n    Processing completed successfully DONE\n    View Domain Summary`
                  : msg.questionInfo.hasPDFs
                  ? `Query: ${msg.questionInfo.query}\nAdditional PDFs: ${msg.questionInfo.pdfFiles}\nProgress: 100%\n\n${stepsContent}\n    Processing completed successfully DONE\n    View Mindmap\n    View Domain Summary`
                  : `Query: ${msg.questionInfo.query}\nProgress: 100%\n\n${stepsContent}\n    Processing completed successfully DONE\n    View Domain Summary`;
                return {
                  ...msg,
                  content: completionContent,
                  progressPercentage: 100,
                  viewDomainSummaryPath: '/rkb?view=directory',
                  hasPDFs: msg.questionInfo.hasPDFs && !msg.questionInfo.isAfterPDFProcessing,
                };
              }
              return msg;
            });
          });
          
          // Create event card under JSE based on domain name entered
          // Event card is created immediately so it can be updated when domain summary is accepted
          let domainSummaryDividendsInfo = null;
          const jseReg = regulations.find(
            (r) =>
              r.title.toLowerCase().includes('johannesburg') ||
              r.title.toLowerCase().includes('jse')
          );
          if (jseReg && domainName) {
            // Check if event already exists for this domain
            const existingEvent = jseReg.events?.find(e => e.name.toLowerCase() === domainName.toLowerCase());
            let eventId;
            if (existingEvent) {
              eventId = existingEvent.id;
            } else {
              const newEvent = {
                name: domainName,
                description: `Disclosure and requirements related to ${domainName} under JSE listing requirements.`,
                category: 'Corporate Actions',
                keywords: [domainName.toLowerCase(), 'disclosure', 'requirements'],
                hasTabs: true,
                summaryText: '',
                regulations: [],
              };
              eventId = addEventToRegulation(jseReg.id, newEvent);
            }
            domainSummaryDividendsInfo = { 
              regulationId: jseReg.id, 
              eventId, 
              domainName, 
              hasPDFs: hasUploadedPDFs,
              pdfFiles: pdfFileNames,
            };
          }

          // Store domainSummaryDividendsInfo in the progress message so View Domain Summary can open popup
          if (domainSummaryDividendsInfo) {
            setChatMessages((prev) =>
              prev.map((msg) =>
                msg.id === newProgressMessageId && msg.isProgress
                  ? { ...msg, domainSummaryDividendsInfo }
                  : msg
              )
            );
          }

          // Add answer message
          setTimeout(() => {
            const answer = generateDummyAnswer(question);
            setChatMessages((prev) => [
              ...prev,
              {
                type: 'system',
                content: answer,
                timestamp: new Date(),
              },
            ]);
          }, 500);
        }, 800);
      }
    }, 1000);

    setQuestionInput('');
    // Don't clear domainUploadedFiles here - they'll be cleared after domain summary is accepted
  };

  const handleViewDomainSummary = (msg) => {
    if (msg.domainSummaryDividendsInfo) {
      // Include PDF information if available
      const domainInfo = {
        ...msg.domainSummaryDividendsInfo,
        hasPDFs: msg.hasPDFs || msg.domainSummaryDividendsInfo.hasPDFs,
        pdfFiles: msg.questionInfo?.pdfFiles || '',
      };
      setDomainSummaryInfo(domainInfo);
      setShowDomainSummaryPopup(true);
    } else {
      navigate('/rkb?view=directory');
    }
  };

  const handleDomainSummaryAccept = () => {
    setShowDomainSummaryPopup(false);
    if (!domainSummaryInfo) return;
    const { regulationId, eventId, domainName, hasPDFs } = domainSummaryInfo;
    
    // Mark the message as acted upon (disable View Domain Summary link)
    setChatMessages((prev) =>
      prev.map((msg) =>
        msg.domainSummaryDividendsInfo &&
        msg.domainSummaryDividendsInfo.regulationId === regulationId &&
        msg.domainSummaryDividendsInfo.eventId === eventId
          ? { ...msg, domainSummaryActedUpon: true }
          : msg
      )
    );
    
    setDomainSummaryInfo(null);
    
    // If PDFs were uploaded, this creates a new card - clear domain files after processing
    if (hasPDFs) {
      setDomainUploadedFiles([]);
    }

    const oblMessageId = `obl-${Date.now()}`;
    setCreatingObligationsMessageId(oblMessageId);
    setChatMessages((prev) => [
      ...prev,
      {
        id: oblMessageId,
        type: 'system',
        content: 'Creating obligations...\nProgress: 0%',
        timestamp: new Date(),
        isProgress: true,
        progressPercentage: 0,
        isCreatingObligations: true,
      },
    ]);

    let step = 0;
    const steps = ['Analyzing requirements...', 'Mapping obligations...', 'Creating rules...', 'Finalizing...'];
    const interval = setInterval(() => {
      step++;
      const pct = Math.round((step / steps.length) * 100);
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === oblMessageId && m.isCreatingObligations
            ? {
                ...m,
                content: `Creating obligations...\nProgress: ${pct}%\n\n    ${steps.slice(0, step).join('\n    ')}`,
                progressPercentage: pct,
              }
            : m
        )
      );
      if (step >= steps.length) {
        clearInterval(interval);
        setCreatingObligationsMessageId(null);
        updateEventToRegulation(regulationId, eventId, {
          summaryText: DOMAIN_SUMMARY_TEXT,
          regulations: DIVIDENDS_OBLIGATIONS_DATA,
        });
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === oblMessageId
              ? {
                  ...m,
                  content: `Creating obligations...\nProgress: 100%\n\n    ${steps.join('\n    ')}\n    Creating obligations completed DONE\n    View Obligations`,
                  progressPercentage: 100,
                  viewObligationsPath: `/regulation/${regulationId}/event/${eventId}`,
                  showFindNewDomain: true,
                }
              : m
          )
        );
      }
    }, 800);
  };

  const handleDomainSummaryReject = () => {
    if (domainSummaryInfo) {
      // removeEvent will automatically remove the regulation if it has no events left
      removeEvent(domainSummaryInfo.regulationId, domainSummaryInfo.eventId);
      
      // Mark the message as acted upon (disable View Domain Summary link)
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.domainSummaryDividendsInfo &&
          msg.domainSummaryDividendsInfo.regulationId === domainSummaryInfo.regulationId &&
          msg.domainSummaryDividendsInfo.eventId === domainSummaryInfo.eventId
            ? { ...msg, domainSummaryActedUpon: true }
            : msg
        )
      );
    }
    setShowDomainSummaryPopup(false);
    setDomainSummaryInfo(null);
    setChatMessages((prev) => [
      ...prev,
      {
        type: 'system',
        content: 'Domain summary was rejected.',
        timestamp: new Date(),
        isRejectMessage: true,
      },
    ]);
  };

  const handleFindNewDomain = () => {
    setQuestionInput('');
    setDomainUploadedFiles([]);
    setShowDomainInput(true);
    setTimeout(() => {
      if (questionInputRef.current) {
        questionInputRef.current.focus();
        questionInputRef.current.placeholder = 'Enter Domain Name';
      }
    }, 100);
  };

  const handleDomainDragOver = (e) => {
    e.preventDefault();
    setIsDomainDragging(true);
  };

  const handleDomainDragLeave = (e) => {
    e.preventDefault();
    setIsDomainDragging(false);
  };

  const handleDomainDrop = (e) => {
    e.preventDefault();
    setIsDomainDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleDomainFilesSelect(files);
  };

  const handleDomainFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      handleDomainFilesSelect(files);
    }
  };

  const handleDomainFilesSelect = (files) => {
    const pdfFiles = files.filter(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    const newFiles = pdfFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      file: file,
    }));
    setDomainUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDomainUploadClick = () => {
    if (domainFileInputRef.current) {
      domainFileInputRef.current.click();
    }
  };

  const handleRemoveDomainFile = (fileId) => {
    setDomainUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleStartDomainPDFProcessing = () => {
    if (domainUploadedFiles.length === 0) return;
    
    setIsDomainPDFProcessing(true);
    const pdfFileNames = domainUploadedFiles.map(f => f.name).join(', ');
    
    // Add user message
    setChatMessages((prev) => [
      ...prev,
      {
        type: 'user',
        content: `Process ${domainUploadedFiles.length} additional PDF(s): ${pdfFileNames}`,
        timestamp: new Date(),
      },
    ]);

    // Create progress message starting from step 2 (Text Extraction)
    const newProgressMessageId = `domain-pdf-progress-${Date.now()}`;
    setProgressMessageId(newProgressMessageId);
    const initialContent = `Additional PDFs: ${pdfFileNames}\nProgress: 0%\n\n${domainPDFProgressSteps.map((s) => `    ${s.name}`).join('\n')}`;
    
    setChatMessages((prev) => [
      ...prev,
      {
        id: newProgressMessageId,
        type: 'system',
        content: initialContent,
        timestamp: new Date(),
        isProgress: true,
        progressSteps: domainPDFProgressSteps.map((step) => ({ ...step, status: 'pending' })),
        pdfInfo: {
          files: pdfFileNames,
          fileCount: domainUploadedFiles.length,
        },
        progressPercentage: 0,
        isDomainPDFProcessing: true,
      },
    ]);

    // Progress steps - 4 steps, 1 second each
    let stepIndex = 0;
    const totalSteps = domainPDFProgressSteps.length;
    const stepInterval = setInterval(() => {
      stepIndex++;
      const percentage = Math.round((stepIndex / totalSteps) * 100);

      // Update the progress message with current step
      setChatMessages((prev) => {
        return prev.map((msg) => {
          if (msg.id === newProgressMessageId && msg.isProgress && msg.isDomainPDFProcessing) {
            const updatedSteps = msg.progressSteps.map((s, idx) => {
              if (idx === stepIndex - 1) {
                return { ...s, status: 'processing' };
              }
              return s;
            });
            const stepsContent = updatedSteps
              .map((s) => {
                if (s.status === 'processing') return `    ${s.name}...`;
                if (s.status === 'done') return `    ${s.name} DONE`;
                return `    ${s.name}`;
              })
              .join('\n');
            const content = `Additional PDFs: ${msg.pdfInfo.files}\nProgress: ${percentage}%\n\n${stepsContent}`;
            return {
              ...msg,
              progressSteps: updatedSteps,
              content,
              progressPercentage: percentage,
            };
          }
          return msg;
        });
      });

      // After a brief delay, mark step as done
      setTimeout(() => {
        setChatMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === newProgressMessageId && msg.isProgress && msg.isDomainPDFProcessing) {
              const updatedSteps = msg.progressSteps.map((s, idx) => {
                if (idx === stepIndex - 1) {
                  return { ...s, status: 'done' };
                }
                return s;
              });
              const stepsContent = updatedSteps
                .map((s) => {
                  if (s.status === 'processing') return `    ${s.name}...`;
                  if (s.status === 'done') return `    ${s.name} DONE`;
                  return `    ${s.name}`;
                })
                .join('\n');
              const currentPercentage = Math.round((stepIndex / totalSteps) * 100);
              const content = `Additional PDFs: ${msg.pdfInfo.files}\nProgress: ${currentPercentage}%\n\n${stepsContent}`;
              return {
                ...msg,
                progressSteps: updatedSteps,
                content,
                progressPercentage: currentPercentage,
              };
            }
            return msg;
          });
        });
      }, 800);

      if (stepIndex >= totalSteps) {
        clearInterval(stepInterval);
        setIsDomainPDFProcessing(false);
        
        // Add completion message with View Mindmap link only
        setTimeout(() => {
          setChatMessages((prev) => {
            return prev.map((msg) => {
              if (msg.id === newProgressMessageId && msg.isProgress && msg.isDomainPDFProcessing) {
                const stepsContent = msg.progressSteps
                  .map((s) => `    ${s.name} DONE`)
                  .join('\n');
                const content = `Additional PDFs: ${msg.pdfInfo.files}\nProgress: 100%\n\n${stepsContent}\n    Processing completed successfully DONE\n    View Mindmap`;
                
                return {
                  ...msg,
                  content,
                  progressPercentage: 100,
                  viewMindmapPath: '/rkb?view=directory',
                  isDomainPDFProcessing: false,
                };
              }
              return msg;
            });
          });
          
          // Show domain input after processing completes (after a delay)
          setTimeout(() => {
            setIsDomainInputAfterPDF(true);
            setShowDomainInput(true);
            if (questionInputRef.current) {
              questionInputRef.current.focus();
              questionInputRef.current.placeholder = 'Enter Domain Name';
            }
          }, 1500);
          
          // Clear domain uploaded files after processing
          setDomainUploadedFiles([]);
        }, 800);
      }
    }, 1000);
  };

  const [showMindmapPopup, setShowMindmapPopup] = useState(false);

  const handleViewNavigator = () => {
    setShowMindmapPopup(true);
  };

  const handleCloseNavigator = () => {
    setShowMindmapPopup(false);
  };

  const handleExpandNavigator = () => {
    window.open('/navigator.png', '_blank');
  };

  useEffect(() => {
    if (processingComplete) {
      setShowDomainInput(true);
      if (questionInputRef.current) {
        questionInputRef.current.focus();
      }
    }
  }, [processingComplete]);

  // Helper function to render a single chat message
  const renderMessage = (msg, idx) => {
    const trimmedLine = (line) => line.trim();
    const isRegulationDetail = (line) => line.startsWith('Regulation Name:') || line.startsWith('Files:');
    const isQueryDetail = (line) => line.startsWith('Query:');
    const isPDFDetail = (line) => line.startsWith('Additional PDFs:');
    const isProgress = (line) => line.startsWith('Progress:');
    const hasDone = (line) => line.includes('DONE');
    const isEmpty = (line) => !line.trim();
    const isViewMindmap = (line) => line.startsWith('View Mindmap');
    const isViewDomainSummary = (line) => line.startsWith('View Domain Summary');
    const isViewObligations = (line) => line.startsWith('View Obligations');

    return (
      <div key={idx} className={`add-regulation-chat-message ${msg.type === 'user' ? 'user-message' : 'system-message'}`}>
        {msg.type === 'system' && <div className="add-regulation-message-avatar">AI</div>}
        <div className="add-regulation-message-content">
          {msg.isProgress ? (
            <div className="add-regulation-progress-steps-container">
              {msg.content.split('\n').map((line, lineIdx) => {
                const trimmed = trimmedLine(line);
                return (
                  <div key={lineIdx} className={`add-regulation-progress-step-line ${isRegulationDetail(trimmed) ? 'regulation-detail' : ''} ${isQueryDetail(trimmed) ? 'query-detail' : ''} ${isPDFDetail(trimmed) ? 'pdf-detail' : ''} ${isProgress(trimmed) ? 'progress-line' : ''} ${hasDone(line) ? 'step-done' : ''} ${isEmpty(trimmed) ? 'empty-line' : ''} ${isViewMindmap(trimmed) ? 'view-mindmap-line' : ''} ${isViewDomainSummary(trimmed) ? 'view-domain-summary-line' : ''} ${isViewObligations(trimmed) ? 'view-obligations-line' : ''}`}>
                    {isRegulationDetail(trimmed) || isQueryDetail(trimmed) || isPDFDetail(trimmed) ? (
                      <span>{line}</span>
                    ) : isProgress(trimmed) ? (
                      <div className="add-regulation-progress-line-container">
                        <span className="add-regulation-progress-text">{line}</span>
                        <div className="add-regulation-progress-bar-wrapper">
                          <div className="add-regulation-progress-bar" style={{ width: `${msg.progressPercentage || 0}%` }}></div>
                        </div>
                      </div>
                    ) : isViewMindmap(trimmed) ? (
                      <button
                        className="add-regulation-view-mindmap-link-inline"
                        onClick={handleViewNavigator}
                      >
                        {trimmed}
                      </button>
                    ) : isViewDomainSummary(trimmed) ? (
                      <button
                        className={`add-regulation-view-domain-summary-link-inline ${msg.domainSummaryActedUpon ? 'disabled' : ''}`}
                        onClick={() => !msg.domainSummaryActedUpon && handleViewDomainSummary(msg)}
                        disabled={msg.domainSummaryActedUpon}
                      >
                        {trimmed}
                      </button>
                    ) : isViewObligations(trimmed) ? (
                      <button
                        className="add-regulation-view-obligations-link-inline"
                        onClick={() => navigate(msg.viewObligationsPath || '/rkb?view=directory')}
                      >
                        {trimmed}
                      </button>
                    ) : hasDone(line) ? (
                      <span>
                        {line.split('DONE').map((part, partIdx, arr) => (
                          <span key={partIdx}>
                            {part}
                            {partIdx < arr.length - 1 && <span className="add-regulation-done-text">DONE</span>}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span>{line}</span>
                    )}
                  </div>
                );
              })}
              {msg.showFindNewDomain && (
                <div className="find-new-domain-container">
                  <div className="domain-actions-buttons">
                    <button type="button" className="add-regulation-find-new-domain-button" onClick={handleFindNewDomain}>
                      Search new domain
                    </button>
                    <button type="button" className="add-regulation-upload-pdfs-button" onClick={handleDomainUploadClick}>
                      Upload PDFs
                    </button>
                  </div>
                  {domainUploadedFiles.length > 0 && (
                    <div className="domain-uploaded-files-section">
                      <h4 className="domain-uploaded-files-title">Uploaded PDFs ({domainUploadedFiles.length})</h4>
                      <div className="domain-uploaded-files-list">
                        {domainUploadedFiles.map((fileObj) => (
                          <div key={fileObj.id} className="domain-file-item">
                            <div className="domain-file-info">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                              </svg>
                              <span className="domain-file-name">{fileObj.name}</span>
                            </div>
                            <button
                              className="domain-remove-file-button"
                              onClick={() => handleRemoveDomainFile(fileObj.id)}
                              aria-label="Remove file"
                              disabled={isDomainPDFProcessing}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      {!isDomainPDFProcessing && (
                        <button
                          type="button"
                          className="domain-start-processing-button"
                          onClick={handleStartDomainPDFProcessing}
                        >
                          Start Processing
                        </button>
                      )}
                    </div>
                  )}
                  <input
                    type="file"
                    ref={domainFileInputRef}
                    onChange={handleDomainFileInputChange}
                    accept=".pdf"
                    multiple
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>
          ) : msg.isRejectMessage ? (
            <div>
              <p style={{ whiteSpace: 'pre-line' }}>{msg.content}</p>
              <div className="domain-actions-buttons">
                <button type="button" className="add-regulation-find-new-domain-button" onClick={handleFindNewDomain}>
                  Find New Domain
                </button>
                <button type="button" className="add-regulation-upload-pdfs-button" onClick={handleDomainUploadClick}>
                  Upload PDFs
                </button>
              </div>
              {domainUploadedFiles.length > 0 && (
                <div className="domain-uploaded-files-section">
                  <h4 className="domain-uploaded-files-title">Uploaded PDFs ({domainUploadedFiles.length})</h4>
                  <div className="domain-uploaded-files-list">
                    {domainUploadedFiles.map((fileObj) => (
                      <div key={fileObj.id} className="domain-file-item">
                        <div className="domain-file-info">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                          <span className="domain-file-name">{fileObj.name}</span>
                        </div>
                        <button
                          className="domain-remove-file-button"
                          onClick={() => handleRemoveDomainFile(fileObj.id)}
                          aria-label="Remove file"
                          disabled={isDomainPDFProcessing}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  {!isDomainPDFProcessing && (
                    <button
                      type="button"
                      className="domain-start-processing-button"
                      onClick={handleStartDomainPDFProcessing}
                    >
                      Start Processing
                    </button>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={domainFileInputRef}
                onChange={handleDomainFileInputChange}
                accept=".pdf"
                multiple
                style={{ display: 'none' }}
              />
            </div>
          ) : msg.showFindNewDomain ? (
            <div>
              <p style={{ whiteSpace: 'pre-line' }}>{msg.content}</p>
              <div className="domain-actions-buttons">
                <button type="button" className="add-regulation-find-new-domain-button" onClick={handleFindNewDomain}>
                  Find New Domain
                </button>
                <button type="button" className="add-regulation-upload-pdfs-button" onClick={handleDomainUploadClick}>
                  Upload PDFs
                </button>
              </div>
              {domainUploadedFiles.length > 0 && (
                <div className="domain-uploaded-files-section">
                  <h4 className="domain-uploaded-files-title">Uploaded PDFs ({domainUploadedFiles.length})</h4>
                  <div className="domain-uploaded-files-list">
                    {domainUploadedFiles.map((fileObj) => (
                      <div key={fileObj.id} className="domain-file-item">
                        <div className="domain-file-info">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                          <span className="domain-file-name">{fileObj.name}</span>
                        </div>
                        <button
                          className="domain-remove-file-button"
                          onClick={() => handleRemoveDomainFile(fileObj.id)}
                          aria-label="Remove file"
                          disabled={isDomainPDFProcessing}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  {!isDomainPDFProcessing && (
                    <button
                      type="button"
                      className="domain-start-processing-button"
                      onClick={handleStartDomainPDFProcessing}
                    >
                      Start Processing
                    </button>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={domainFileInputRef}
                onChange={handleDomainFileInputChange}
                accept=".pdf"
                multiple
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <p style={{ whiteSpace: 'pre-line' }}>{msg.content}</p>
          )}
        </div>
        {msg.type === 'user' && <div className="add-regulation-message-avatar user-avatar">You</div>}
      </div>
    );
  };

  return (
    <div className="add-regulation-page-container">
      <div className="add-regulation-page-header">
        <button className="add-regulation-back-button" onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Regulations
        </button>
        <h1 className="add-regulation-page-title">Add Regulation</h1>
      </div>
      
      <div className="add-regulation-chat-container" ref={chatContainerRef}>
        {chatMessages.map((msg, idx) => renderMessage(msg, idx))}

        {/* File Upload Area - Show when no files uploaded and not processing/complete */}
        {uploadedFiles.length === 0 && !isSubmitting && !processingComplete && (
          <div className="add-regulation-chat-message system-message">
            <div className="add-regulation-message-avatar">AI</div>
            <div className="add-regulation-message-content">
              <div
                className={`add-regulation-file-upload-area ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".pdf"
                  multiple
                  style={{ display: 'none' }}
                  disabled={isSubmitting}
                />
                <div className="add-regulation-upload-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <p className="add-regulation-upload-instruction">
                  Drag and drop PDF files here or click to upload
                </p>
                <p className="add-regulation-upload-formats">(Multiple PDF files supported)</p>
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Files List - Hide during and after processing */}
        {uploadedFiles.length > 0 && !isSubmitting && !processingComplete && (
          <div className="add-regulation-uploaded-files-section">
            <h3 className="add-regulation-uploaded-files-title">Uploaded Files ({uploadedFiles.length})</h3>
            <div className="add-regulation-uploaded-files-list">
              {uploadedFiles.map((fileObj) => (
                <div key={fileObj.id} className="add-regulation-file-item">
                  <div className="add-regulation-file-info">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <span className="add-regulation-file-name">{fileObj.name}</span>
                    <span className="add-regulation-file-size">
                      ({(fileObj.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    className="add-regulation-remove-file-button"
                    onClick={() => handleRemoveFile(fileObj.id)}
                    aria-label="Remove file"
                    disabled={isSubmitting}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              className="add-regulation-add-more-files-button"
              onClick={handleUploadClick}
              disabled={isSubmitting}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add More Files
            </button>
          </div>
        )}

        {/* Mandatory Text Field - Hide during and after processing */}
        {uploadedFiles.length > 0 && !isSubmitting && !processingComplete && (
          <div className="add-regulation-mandatory-field-section">
            <div className="add-regulation-mandatory-field-wrapper">
              <label htmlFor="mandatory-text-field" className="add-regulation-mandatory-field-label">
                Regulation Name: <span className="add-regulation-required">*</span>
              </label>
              <input
                type="text"
                id="mandatory-text-field"
                className="add-regulation-mandatory-input"
                value={mandatoryTextField}
                onChange={(e) => setMandatoryTextField(e.target.value)}
                placeholder="Enter regulation name..."
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="add-regulation-description-field-wrapper">
              <label htmlFor="regulation-description-field" className="add-regulation-mandatory-field-label">
                Description: <span className="add-regulation-optional">(Optional)</span>
              </label>
              <textarea
                id="regulation-description-field"
                className="add-regulation-description-input"
                value={regulationDescription}
                onChange={(e) => setRegulationDescription(e.target.value)}
                placeholder="Enter regulation description..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button - Hide during and after processing */}
      {uploadedFiles.length > 0 && !isSubmitting && !processingComplete && (
        <div className="add-regulation-submit-section">
          <button
            className="add-regulation-submit-button"
            onClick={handleSubmit}
            disabled={!mandatoryTextField.trim()}
          >
            Submit
          </button>
        </div>
      )}

      {/* Domain Summary Popup */}
      {showDomainSummaryPopup && (
        <div className="add-regulation-popup-overlay" onClick={() => { setShowDomainSummaryPopup(false); setDomainSummaryInfo(null); }}>
          <div className="add-regulation-popup" onClick={(e) => e.stopPropagation()}>
            <h3 className="add-regulation-popup-title">Domain Summary</h3>
            <div className="add-regulation-popup-body">
              <p className="add-regulation-popup-summary">{DOMAIN_SUMMARY_TEXT}</p>
            </div>
            <div className="add-regulation-popup-actions">
              <button type="button" className="add-regulation-popup-accept" onClick={handleDomainSummaryAccept}>
                Accept
              </button>
              <button type="button" className="add-regulation-popup-reject" onClick={handleDomainSummaryReject}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mindmap Popup */}
      {showMindmapPopup && (
        <div className="add-regulation-popup-overlay" onClick={handleCloseNavigator}>
          <div className="add-regulation-navigator-popup" onClick={(e) => e.stopPropagation()}>
            <div className="add-regulation-navigator-popup-header">
              <h3 className="add-regulation-popup-title">Mindmap</h3>
              <div className="add-regulation-navigator-popup-actions">
                <button type="button" className="add-regulation-navigator-expand-button" onClick={handleExpandNavigator} title="Expand in new tab">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </button>
                <button type="button" className="add-regulation-popup-close" onClick={handleCloseNavigator} title="Close">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            <div className="add-regulation-navigator-popup-body">
              <img src="/navigator.png" alt="Mindmap" className="add-regulation-navigator-image" />
            </div>
          </div>
        </div>
      )}

      {/* Chat Input - Show after processing is complete and when showDomainInput is true */}
      {processingComplete && showDomainInput && (
        <div className="add-regulation-chat-input-container">
          <form onSubmit={handleQuestionSubmit} className="add-regulation-question-form">
            <label className="add-regulation-domain-prompt">Give me details of:</label>
            <div className="add-regulation-domain-input-wrapper">
              <input
                ref={questionInputRef}
                type="text"
                className="add-regulation-question-input"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Enter Domain Name"
              />
              <button type="submit" className="add-regulation-question-submit-button" disabled={!questionInput.trim()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polyline points="22 2 15 22 11 13 2 9 22 2"></polyline>
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AddRegulationChatbot;
