import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UploadDisclosure.css';
import { useDisclosures } from './context/DisclosuresContext';

function UploadDisclosure() {
  const navigate = useNavigate();
  const { addDisclosure, disclosures } = useDisclosures();
  const [selectedFile, setSelectedFile] = useState(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [dateOfEvent, setDateOfEvent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [showFormFields, setShowFormFields] = useState(false);
  const [isInteractMode, setIsInteractMode] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [disclosureId, setDisclosureId] = useState(null);
  const [validationComplete, setValidationComplete] = useState(false);
  const [progressMessageId, setProgressMessageId] = useState(null);
  const scoreSetRef = useRef(false);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const questionInputRef = useRef(null);

  // Watch for compliance score updates - only run once when score becomes available
  useEffect(() => {
    if (disclosureId && progressMessageId && validationComplete) {
      const disclosure = disclosures.find(d => d.id === disclosureId);
      const complianceScore = disclosure?.complianceScore;
      
      if (complianceScore != null && !scoreSetRef.current) {
        setChatMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === progressMessageId && msg.isProgress) {
              // Check if score is already in content
              const hasScoreInContent = msg.content && msg.content.includes('Compliance Score:');
              
              // If score is already in content, don't do anything
              if (hasScoreInContent) {
                scoreSetRef.current = true;
                return msg;
              }
              
              // Only add score if it's not already there
              // Append to existing content instead of rebuilding
              const content = `${msg.content}\n    Compliance Score: ${complianceScore}%`;
              scoreSetRef.current = true;
              return {
                ...msg,
                content,
                complianceScore,
                viewReportPath: msg.viewReportPath || (disclosureId ? `/validation/${disclosureId}` : null),
              };
            }
            return msg;
          });
        });
      }
    }
  }, [disclosures, disclosureId, progressMessageId, validationComplete]);

  const progressSteps = [
    { name: 'OCR Extraction', id: 'ocr' },
    { name: 'Text Embedding', id: 'embedding' },
    { name: 'Regulation Matching', id: 'matching' },
    { name: 'Compliance Analysis', id: 'analysis' },
    { name: 'Rule Validation', id: 'validation' },
    { name: 'Report Generation', id: 'report' },
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (isInteractMode && questionInputRef.current) {
      questionInputRef.current.focus();
    }
  }, [isInteractMode]);

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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const isPdf = file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      setSelectedFile(file);
      setValidationComplete(false);
      setDisclosureId(null);
      setChatMessages((prev) => [
        ...prev,
        {
          type: 'system',
          content: `File "${file.name}" uploaded successfully. What would you like to do?`,
          timestamp: new Date(),
        },
      ]);
    } else {
      alert('Please upload a PDF file.');
    }
  };

  const handleUploadAnotherPDF = () => {
    setSelectedFile(null);
    setValidationComplete(false);
    setDisclosureId(null);
    setShowFormFields(false);
    setIsInteractMode(false);
    setAnnouncementTitle('');
    setDateOfEvent('');
    // Keep chat history - just add a new message
    setChatMessages((prev) => [
      ...prev,
      {
        type: 'system',
        content: 'Please upload a new PDF document to continue.',
        timestamp: new Date(),
      },
    ]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const generateDummyAnswer = (question) => {
    const lowerQuestion = question.toLowerCase();
    const answers = [
      'Based on the document analysis, the information you\'re looking for appears in section 3.2 of the PDF. The relevant details indicate compliance with Regulation 30 requirements.',
      'The document shows that the announcement was made within the required 24-hour timeframe as per SEBI guidelines. The disclosure includes all mandatory fields.',
      'According to the extracted text, the credit rating information is present and matches the format specified in Schedule III Part A. The document appears to be compliant.',
      'The PDF contains the necessary regulatory references and includes proper signatory authorization. All required disclosures are present in the document.',
      'Based on my analysis, the document meets the compliance criteria for the specified regulations. The formatting and content align with SEBI LODR requirements.',
      'The document analysis reveals that all mandatory sections are completed. The date of event, announcement title, and regulatory references are all properly documented.',
    ];
    
    // Try to match question keywords to provide more relevant answers
    if (lowerQuestion.includes('summary') || lowerQuestion.includes('overview')) {
      return 'This document is a regulatory disclosure related to credit rating changes. It includes details about the rating agency, the nature of the rating change, and compliance with SEBI LODR regulations. The document appears to be properly formatted and contains all required information.';
    }
    if (lowerQuestion.includes('regulation') || lowerQuestion.includes('compliance')) {
      return 'The document references Regulation 30 and Schedule III Part A. Based on the analysis, it appears to comply with the disclosure requirements, including timely submission and proper formatting as per SEBI guidelines.';
    }
    if (lowerQuestion.includes('date') || lowerQuestion.includes('when')) {
      return 'The document indicates the event date and announcement date are within the acceptable timeframe. The dates mentioned align with the regulatory requirements for timely disclosure.';
    }
    if (lowerQuestion.includes('rating') || lowerQuestion.includes('credit')) {
      return 'The credit rating information is clearly stated in the document. It includes details about the rating agency, the type of rating, and any changes or revisions to the rating status.';
    }
    
    // Return random answer if no keyword match
    return answers[Math.floor(Math.random() * answers.length)];
  };

  const handleInteractWithPDF = () => {
    setIsInteractMode(true);
    setShowFormFields(false);
    setChatMessages((prev) => [
      ...prev,
      {
        type: 'user',
        content: 'Interact with PDF',
        timestamp: new Date(),
      },
      {
        type: 'system',
        content: 'I\'m ready to help you understand your PDF document. Ask me any questions about the content, compliance requirements, or specific details you\'d like to know.',
        timestamp: new Date(),
      },
    ]);
  };

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (!questionInput.trim()) return;

    const question = questionInput.trim();
    setChatMessages((prev) => [
      ...prev,
      {
        type: 'user',
        content: question,
        timestamp: new Date(),
      },
    ]);

    // Generate dummy answer
    const answer = generateDummyAnswer(question);
    
    // Simulate thinking delay
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          type: 'system',
          content: answer,
          timestamp: new Date(),
        },
      ]);
    }, 500);

    setQuestionInput('');
  };

  const handleGetComplianceScore = () => {
    setIsInteractMode(false);
    setShowFormFields(true);
    setChatMessages((prev) => [
      ...prev,
      {
        type: 'user',
        content: 'Get Compliance Score',
        timestamp: new Date(),
      },
    ]);
  };

  const handleRunValidation = () => {
    if (!announcementTitle.trim()) {
      alert('Please enter an Announcement Title');
      return;
    }
    if (!dateOfEvent.trim()) {
      alert('Please enter a Date of Event');
      return;
    }
    if (!selectedFile) {
      alert('Please upload a PDF file');
      return;
    }
    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      alert('Only PDF uploads are supported at the moment');
      return;
    }

    const disclosureResult = addDisclosure({
      announcementTitle: announcementTitle.trim(),
      dateOfEvent,
      fileName: selectedFile.name,
    });

    const newDisclosureId = disclosureResult.id;
    const immediateComplianceScore = disclosureResult.complianceScore;
    setDisclosureId(newDisclosureId);
    setIsValidating(true);
    setCurrentStep(0);
    setProgressPercentage(0);
    setShowFormFields(false);

    // Format date for display
    const formatDate = (dateString) => {
      if (!dateString) return '';
      try {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      } catch {
        return dateString;
      }
    };

    // Add single progress message that will be updated
    const newProgressMessageId = `progress-${Date.now()}`;
    setProgressMessageId(newProgressMessageId);
    scoreSetRef.current = false; // Reset ref for new validation
    const initialContent = `File: ${selectedFile.name}\nTitle: ${announcementTitle.trim()}\nEvent Date: ${formatDate(dateOfEvent)}\nProgress: 0%\n\n${progressSteps.map((s) => `    ${s.name}`).join('\n')}`;
    
    setChatMessages((prev) => [
      ...prev,
      {
        id: newProgressMessageId,
        type: 'system',
        content: initialContent,
        timestamp: new Date(),
        isProgress: true,
        progressSteps: progressSteps.map((step) => ({ ...step, status: 'pending' })),
        fileInfo: {
          fileName: selectedFile.name,
          title: announcementTitle.trim(),
          eventDate: dateOfEvent,
        },
        progressPercentage: 0,
      },
    ]);

    // Progress steps in chat - 6 steps, 1 second each
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      stepIndex++;
      setCurrentStep(stepIndex);
      const percentage = Math.round((stepIndex / progressSteps.length) * 100);
      setProgressPercentage(percentage);

      // Update the progress message with current step
      const step = progressSteps[stepIndex - 1];
      const formatDateForUpdate = (dateString) => {
        if (!dateString) return '';
        try {
          const [year, month, day] = dateString.split('-');
          return `${day}/${month}/${year}`;
        } catch {
          return dateString;
        }
      };
      
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
            // Build content string with file info and steps
            const stepsContent = updatedSteps
              .map((s) => {
                if (s.status === 'processing') return `    ${s.name}...`;
                if (s.status === 'done') return `    ${s.name} DONE`;
                return `    ${s.name}`;
              })
              .join('\n');
            const content = `File: ${msg.fileInfo.fileName}\nTitle: ${msg.fileInfo.title}\nEvent Date: ${formatDateForUpdate(msg.fileInfo.eventDate)}\nProgress: ${percentage}%\n\n${stepsContent}`;
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
        const formatDateForUpdate = (dateString) => {
          if (!dateString) return '';
          try {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
          } catch {
            return dateString;
          }
        };
        
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
              // Build content string with file info and steps
              const stepsContent = updatedSteps
                .map((s) => {
                  if (s.status === 'processing') return `    ${s.name}...`;
                  if (s.status === 'done') return `    ${s.name} DONE`;
                  return `    ${s.name}`;
                })
                .join('\n');
              const currentPercentage = Math.round((stepIndex / progressSteps.length) * 100);
              const content = `File: ${msg.fileInfo.fileName}\nTitle: ${msg.fileInfo.title}\nEvent Date: ${formatDateForUpdate(msg.fileInfo.eventDate)}\nProgress: ${currentPercentage}%\n\n${stepsContent}`;
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
      setIsValidating(false);
        setValidationComplete(true);
        
        // Add "Validation completed successfully" as the last step in the same message
        setTimeout(() => {
          const formatDateForFinal = (dateString) => {
            if (!dateString) return '';
            try {
              const [year, month, day] = dateString.split('-');
              return `${day}/${month}/${year}`;
            } catch {
              return dateString;
            }
          };
          
          // Update with completion message - use the compliance score returned from addDisclosure
          const complianceScore = immediateComplianceScore;
          
          setChatMessages((prev) => {
            return prev.map((msg) => {
              if (msg.id === newProgressMessageId && msg.isProgress) {
                const stepsContent = msg.progressSteps
                  .map((s) => `    ${s.name} DONE`)
                  .join('\n');
                const viewReportLink = newDisclosureId ? `\n    View Report` : '';
                const scoreLine = complianceScore != null ? `\n    Compliance Score: ${complianceScore}%` : '';
                const content = `File: ${msg.fileInfo.fileName}\nTitle: ${msg.fileInfo.title}\nEvent Date: ${formatDateForFinal(msg.fileInfo.eventDate)}\nProgress: 100%\n\n${stepsContent}\n    Validation completed successfully DONE${scoreLine}${viewReportLink}`;
                // Mark that score has been set to prevent useEffect from overwriting
                if (complianceScore != null) {
                  scoreSetRef.current = true;
                }
                return {
                  ...msg,
                  content,
                  progressPercentage: 100,
                  complianceScore: complianceScore || msg.complianceScore,
                  viewReportPath: newDisclosureId ? `/validation/${newDisclosureId}` : null,
                };
              }
              return msg;
            });
          });
          
          // Add next steps message
          setTimeout(() => {
            setChatMessages((prev) => [
              ...prev,
              {
                type: 'system',
                content: 'Would you like to upload another PDF document?',
                timestamp: new Date(),
              },
            ]);
          }, 500);
        }, 800);
      }
    }, 1000);
  };


  return (
    <div className="chat-upload-container">
      <h1 className="chat-page-title">Upload Disclosure</h1>
      
      <div className="chat-container" ref={chatContainerRef}>
        {!selectedFile && (
          <div className="chat-message system-message">
            <div className="message-avatar">AI</div>
            <div className="message-content">
              <p>Welcome! Please upload a PDF document to get started.</p>
              <div
                className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
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
            style={{ display: 'none' }}
          />
          <div className="upload-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <p className="upload-instruction">
            Drag and drop a file here or click to upload
          </p>
          <p className="upload-formats">(.PDF files only)</p>
              </div>
            </div>
          </div>
        )}

        {selectedFile && !showFormFields && !isInteractMode && !validationComplete && (
          <>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.type === 'user' ? 'user-message' : 'system-message'}`}>
                {msg.type === 'system' && <div className="message-avatar">AI</div>}
                <div className="message-content">
                  {msg.isLink ? (
                    <button
                      className="view-report-link"
                      onClick={() => navigate(msg.linkPath)}
                    >
                      {msg.content}
                    </button>
                  ) : msg.isProgress ? (
                    <div className="progress-steps-container">
                      {msg.content.split('\n').map((line, idx) => {
                        const trimmedLine = line.trim();
                        const isFileDetail = trimmedLine.startsWith('File:') || trimmedLine.startsWith('Title:') || trimmedLine.startsWith('Event Date:');
                        const isProgress = trimmedLine.startsWith('Progress:');
                        const hasDone = line.includes('DONE');
                        const isEmpty = trimmedLine === '';
                        const isComplianceScore = trimmedLine.startsWith('Compliance Score:');
                        const isViewReport = trimmedLine.startsWith('View Report');
                        return (
                          <div key={idx} className={`progress-step-line ${isFileDetail ? 'file-detail' : ''} ${isProgress ? 'progress-line' : ''} ${hasDone ? 'step-done' : ''} ${isEmpty ? 'empty-line' : ''} ${isComplianceScore ? 'compliance-score-line' : ''} ${isViewReport ? 'view-report-line' : ''}`}>
                            {isFileDetail ? (
                              <span>{line}</span>
                            ) : isProgress ? (
                              <div className="progress-line-container">
                                <span className="progress-text">{line}</span>
                                <div className="progress-bar-wrapper">
                                  <div className="progress-bar" style={{ width: `${msg.progressPercentage || 0}%` }}></div>
                                </div>
                              </div>
                            ) : isComplianceScore ? (() => {
                              // Extract score from line or use msg.complianceScore
                              const trimmedLine = line.trim();
                              const scoreText = trimmedLine.replace('Compliance Score: ', '').replace('%', '').trim();
                              const score = msg.complianceScore != null ? msg.complianceScore : (scoreText ? parseInt(scoreText, 10) : null);
                              const scoreClass = score != null && !isNaN(score) ? getScoreIndicatorClass(score) : '';
                              return (
                                <span className={`compliance-score-display ${scoreClass}`}>
                                  {scoreClass && <span className={`score-indicator ${scoreClass}`} />}
                                  <span className="compliance-score-text">{trimmedLine}</span>
                                </span>
                              );
                            })(                            ) : isViewReport ? (
                              <button
                                className="view-report-link-inline"
                                onClick={() => {
                                  const path = msg.viewReportPath || (disclosureId ? `/validation/${disclosureId}` : '/validation');
                                  navigate(path);
                                }}
                              >
                                {trimmedLine}
                              </button>
                            ) : hasDone ? (
                              <span>
                                {line.split('DONE').map((part, partIdx, arr) => (
                                  <span key={partIdx}>
                                    {part}
                                    {partIdx < arr.length - 1 && <span className="done-text">DONE</span>}
                                  </span>
                                ))}
                              </span>
                            ) : (
                              <span>{line}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
                {msg.type === 'user' && <div className="message-avatar user-avatar">You</div>}
              </div>
            ))}
            {!isValidating && (
              <div className="action-buttons-container">
                <button className="action-button interact-button" onClick={handleInteractWithPDF}>
                  Interact with PDF
                </button>
                <button className="action-button compliance-button" onClick={handleGetComplianceScore}>
                  Get Compliance Score
                </button>
                <button className="action-button upload-another-button" onClick={handleUploadAnotherPDF}>
                  Upload Another PDF
                </button>
              </div>
            )}
          </>
        )}

        {selectedFile && isInteractMode && !validationComplete && (
          <>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.type === 'user' ? 'user-message' : 'system-message'}`}>
                {msg.type === 'system' && <div className="message-avatar">AI</div>}
                <div className="message-content">
                  {msg.isLink ? (
                    <button
                      className="view-report-link"
                      onClick={() => navigate(msg.linkPath)}
                    >
                      {msg.content}
                    </button>
                  ) : msg.isProgress ? (
                    <div className="progress-steps-container">
                      {msg.content.split('\n').map((line, idx) => {
                        const trimmedLine = line.trim();
                        const isFileDetail = trimmedLine.startsWith('File:') || trimmedLine.startsWith('Title:') || trimmedLine.startsWith('Event Date:');
                        const isProgress = trimmedLine.startsWith('Progress:');
                        const hasDone = line.includes('DONE');
                        const isEmpty = trimmedLine === '';
                        const isComplianceScore = trimmedLine.startsWith('Compliance Score:');
                        const isViewReport = trimmedLine.startsWith('View Report');
                        return (
                          <div key={idx} className={`progress-step-line ${isFileDetail ? 'file-detail' : ''} ${isProgress ? 'progress-line' : ''} ${hasDone ? 'step-done' : ''} ${isEmpty ? 'empty-line' : ''} ${isComplianceScore ? 'compliance-score-line' : ''} ${isViewReport ? 'view-report-line' : ''}`}>
                            {isFileDetail ? (
                              <span>{line}</span>
                            ) : isProgress ? (
                              <div className="progress-line-container">
                                <span className="progress-text">{line}</span>
                                <div className="progress-bar-wrapper">
                                  <div className="progress-bar" style={{ width: `${msg.progressPercentage || 0}%` }}></div>
                                </div>
                              </div>
                            ) : isComplianceScore ? (() => {
                              // Extract score from line or use msg.complianceScore
                              const trimmedLine = line.trim();
                              const scoreText = trimmedLine.replace('Compliance Score: ', '').replace('%', '').trim();
                              const score = msg.complianceScore != null ? msg.complianceScore : (scoreText ? parseInt(scoreText, 10) : null);
                              const scoreClass = score != null && !isNaN(score) ? getScoreIndicatorClass(score) : '';
                              return (
                                <span className={`compliance-score-display ${scoreClass}`}>
                                  {scoreClass && <span className={`score-indicator ${scoreClass}`} />}
                                  <span className="compliance-score-text">{trimmedLine}</span>
                                </span>
                              );
                            })(                            ) : isViewReport ? (
                              <button
                                className="view-report-link-inline"
                                onClick={() => {
                                  const path = msg.viewReportPath || (disclosureId ? `/validation/${disclosureId}` : '/validation');
                                  navigate(path);
                                }}
                              >
                                {trimmedLine}
                              </button>
                            ) : hasDone ? (
                              <span>
                                {line.split('DONE').map((part, partIdx, arr) => (
                                  <span key={partIdx}>
                                    {part}
                                    {partIdx < arr.length - 1 && <span className="done-text">DONE</span>}
                                  </span>
                                ))}
                              </span>
                            ) : (
                              <span>{line}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p>{msg.content}</p>
          )}
        </div>
                {msg.type === 'user' && <div className="message-avatar user-avatar">You</div>}
              </div>
            ))}
            {!isValidating && (
              <>
                <div className="chat-input-container">
                  <form onSubmit={handleQuestionSubmit} className="question-form">
                    <input
                      ref={questionInputRef}
                      type="text"
                      className="question-input"
                      value={questionInput}
                      onChange={(e) => setQuestionInput(e.target.value)}
                      placeholder="Ask a question about your PDF..."
                    />
                    <button type="submit" className="question-submit-button" disabled={!questionInput.trim()}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polyline points="22 2 15 22 11 13 2 9 22 2"></polyline>
                      </svg>
                    </button>
                  </form>
                </div>
                <div className="compliance-button-sticky">
                  <button className="action-button compliance-button" onClick={handleGetComplianceScore}>
                    Get Compliance Score
                  </button>
                  <button className="action-button upload-another-button" onClick={handleUploadAnotherPDF}>
                    Upload Another PDF
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {showFormFields && (
          <>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.type === 'user' ? 'user-message' : 'system-message'}`}>
                {msg.type === 'system' && <div className="message-avatar">AI</div>}
                <div className="message-content">
                  {msg.isLink ? (
                    <button
                      className="view-report-link"
                      onClick={() => navigate(msg.linkPath)}
                    >
                      {msg.content}
                    </button>
                  ) : msg.isProgress ? (
                    <div className="progress-steps-container">
                      {msg.content.split('\n').map((line, idx) => {
                        const trimmedLine = line.trim();
                        const isFileDetail = trimmedLine.startsWith('File:') || trimmedLine.startsWith('Title:') || trimmedLine.startsWith('Event Date:');
                        const isProgress = trimmedLine.startsWith('Progress:');
                        const hasDone = line.includes('DONE');
                        const isEmpty = trimmedLine === '';
                        const isComplianceScore = trimmedLine.startsWith('Compliance Score:');
                        const isViewReport = trimmedLine.startsWith('View Report');
                        return (
                          <div key={idx} className={`progress-step-line ${isFileDetail ? 'file-detail' : ''} ${isProgress ? 'progress-line' : ''} ${hasDone ? 'step-done' : ''} ${isEmpty ? 'empty-line' : ''} ${isComplianceScore ? 'compliance-score-line' : ''} ${isViewReport ? 'view-report-line' : ''}`}>
                            {isFileDetail ? (
                              <span>{line}</span>
                            ) : isProgress ? (
                              <div className="progress-line-container">
                                <span className="progress-text">{line}</span>
                                <div className="progress-bar-wrapper">
                                  <div className="progress-bar" style={{ width: `${msg.progressPercentage || 0}%` }}></div>
                                </div>
                              </div>
                            ) : isComplianceScore ? (() => {
                              // Extract score from line or use msg.complianceScore
                              const trimmedLine = line.trim();
                              const scoreText = trimmedLine.replace('Compliance Score: ', '').replace('%', '').trim();
                              const score = msg.complianceScore != null ? msg.complianceScore : (scoreText ? parseInt(scoreText, 10) : null);
                              const scoreClass = score != null && !isNaN(score) ? getScoreIndicatorClass(score) : '';
                              return (
                                <span className={`compliance-score-display ${scoreClass}`}>
                                  {scoreClass && <span className={`score-indicator ${scoreClass}`} />}
                                  <span className="compliance-score-text">{trimmedLine}</span>
                                </span>
                              );
                            })(                            ) : isViewReport ? (
                              <button
                                className="view-report-link-inline"
                                onClick={() => {
                                  const path = msg.viewReportPath || (disclosureId ? `/validation/${disclosureId}` : '/validation');
                                  navigate(path);
                                }}
                              >
                                {trimmedLine}
                              </button>
                            ) : hasDone ? (
                              <span>
                                {line.split('DONE').map((part, partIdx, arr) => (
                                  <span key={partIdx}>
                                    {part}
                                    {partIdx < arr.length - 1 && <span className="done-text">DONE</span>}
                                  </span>
                                ))}
                              </span>
                            ) : (
                              <span>{line}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
                {msg.type === 'user' && <div className="message-avatar user-avatar">You</div>}
              </div>
            ))}
            {!isValidating && (
              <div className="chat-message system-message">
                <div className="message-avatar">AI</div>
                <div className="message-content form-content">
        <div className="form-fields">
          <div className="form-field">
            <label htmlFor="announcement-title" className="field-label">
              Announcement Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="announcement-title"
              className="form-input"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              placeholder="Enter announcement title"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="date-of-event" className="field-label">
              Date of Event <span className="required">*</span>
            </label>
            <input
              type="date"
              id="date-of-event"
              className="form-input"
              value={dateOfEvent}
              onChange={(e) => setDateOfEvent(e.target.value)}
              required
            />
          </div>
        </div>
          <button
            className="run-validation-button"
            onClick={handleRunValidation}
            disabled={isValidating}
          >
                    {isValidating ? 'Processing...' : 'Submit for Validation'}
          </button>
        </div>
              </div>
            )}
          </>
        )}

        {validationComplete && (
          <>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.type === 'user' ? 'user-message' : 'system-message'}`}>
                {msg.type === 'system' && <div className="message-avatar">AI</div>}
                <div className="message-content">
                  {msg.isLink ? (
                    <button
                      className="view-report-link"
                      onClick={() => navigate(msg.linkPath)}
                    >
                      {msg.content}
              </button>
                  ) : msg.isProgress ? (
                    <div className="progress-steps-container">
                      {msg.content.split('\n').map((line, idx) => {
                        const trimmedLine = line.trim();
                        const isFileDetail = trimmedLine.startsWith('File:') || trimmedLine.startsWith('Title:') || trimmedLine.startsWith('Event Date:');
                        const isProgress = trimmedLine.startsWith('Progress:');
                        const hasDone = line.includes('DONE');
                        const isEmpty = trimmedLine === '';
                        const isComplianceScore = trimmedLine.startsWith('Compliance Score:');
                        const isViewReport = trimmedLine.startsWith('View Report');
                        return (
                          <div key={idx} className={`progress-step-line ${isFileDetail ? 'file-detail' : ''} ${isProgress ? 'progress-line' : ''} ${hasDone ? 'step-done' : ''} ${isEmpty ? 'empty-line' : ''} ${isComplianceScore ? 'compliance-score-line' : ''} ${isViewReport ? 'view-report-line' : ''}`}>
                            {isFileDetail ? (
                              <span>{line}</span>
                            ) : isProgress ? (
                              <div className="progress-line-container">
                                <span className="progress-text">{line}</span>
                                <div className="progress-bar-wrapper">
                                  <div className="progress-bar" style={{ width: `${msg.progressPercentage || 0}%` }}></div>
                                </div>
            </div>
                            ) : isComplianceScore ? (() => {
                              // Extract score from line or use msg.complianceScore
                              const trimmedLine = line.trim();
                              const scoreText = trimmedLine.replace('Compliance Score: ', '').replace('%', '').trim();
                              const score = msg.complianceScore != null ? msg.complianceScore : (scoreText ? parseInt(scoreText, 10) : null);
                              const scoreClass = score != null && !isNaN(score) ? getScoreIndicatorClass(score) : '';
                              return (
                                <span className={`compliance-score-display ${scoreClass}`}>
                                  {scoreClass && <span className={`score-indicator ${scoreClass}`} />}
                                  <span className="compliance-score-text">{trimmedLine}</span>
                                </span>
                              );
                            })(                            ) : isViewReport ? (
                <button 
                                className="view-report-link-inline"
                  onClick={() => {
                                  const path = msg.viewReportPath || (disclosureId ? `/validation/${disclosureId}` : '/validation');
                                  navigate(path);
                                }}
                              >
                                {trimmedLine}
                              </button>
                            ) : hasDone ? (
                              <span>
                                {line.split('DONE').map((part, partIdx, arr) => (
                                  <span key={partIdx}>
                                    {part}
                                    {partIdx < arr.length - 1 && <span className="done-text">DONE</span>}
                                  </span>
                                ))}
                              </span>
                            ) : (
                              <span>{line}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
                {msg.type === 'user' && <div className="message-avatar user-avatar">You</div>}
              </div>
            ))}
            <div className="action-buttons-container">
              <button className="action-button upload-another-button" onClick={handleUploadAnotherPDF}>
                Upload Another PDF
                </button>
            </div>
          </>
        )}
        </div>
    </div>
  );
}

const getScoreIndicatorClass = (score) => {
  if (score >= 80) return 'score-good';
  if (score >= 50) return 'score-warning';
  return 'score-poor';
};

export default UploadDisclosure;
