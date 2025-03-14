// client/src/components/ResumeUploader.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../css/ResumeUploader.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { useNavigate } from 'react-router-dom';

library.add(faFileAlt, faCloudUploadAlt);

function ResumeUploader({ setScore, setIsLoading, isLoading, setFileName }) {
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [jobLocation, setJobLocation] = useState(''); 
    const [jobRole, setJobRole] = useState('');         
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [history, setHistory] = useState([]);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
    const [selectedHistoryItemId, setSelectedHistoryItemId] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const entriesPerPage = 3;

    const historyColumnRef = useRef(null);
    const uploaderColumnRef = useRef(null);
    const insightsColumnRef = useRef(null);
    const [columnHeight, setColumnHeight] = useState('auto');

    const navigate = useNavigate();

    useEffect(() => {
        loadHistoryFromStorage();
    }, []);
    // Add useEffect to dynamically set column heights

    useEffect(() => {
        const adjustColumnHeights = () => {
            const heights = [
                historyColumnRef.current?.clientHeight || 0,
                uploaderColumnRef.current?.clientHeight || 0,
                insightsColumnRef.current?.clientHeight || 0
            ];
            const maxHeight = Math.max(...heights);
            setColumnHeight(`${maxHeight}px`);
        };
        // Call on initial render and window resize
        adjustColumnHeights();
        window.addEventListener('resize', adjustColumnHeights);
        // Clean up event listener
        return () => window.removeEventListener('resize', adjustColumnHeights);
    }, [history, selectedHistoryItem]); // Re-run when content changes
    
    const loadHistoryFromStorage = () => {
        try {
            const storedHistory = localStorage.getItem('uploadHistory');
            if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory);
                if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
                    // Keep newest first (descending by id)
                    setHistory(parsedHistory.sort((a, b) => b.id - a.id));
                }
            }
        } catch (err) {
            localStorage.removeItem('uploadHistory');
        }
    };

    useEffect(() => {
        setTotalPages(Math.ceil(history.length / entriesPerPage));
    }, [history, entriesPerPage]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (validTypes.includes(file.type)) {
            setFile(file);
            setFileName(file.name);
            setError('');
        } else {
            setError('Please upload a PDF or Word document');
            setFile(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!file) {
            setError('Please select a file');
            return;
        }
    
        setIsLoading(true);
        const formData = new FormData();
        formData.append('resume', file);
    
        try {
            formData.append('jobDescription', jobDescription);
            formData.append('location', jobLocation);
            formData.append('role', jobRole);
            const response = await axios.post('/api/analyze-resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            const score = response.data && response.data.atsScore !== undefined
                ? response.data
                : (response.data && typeof response.data === 'object' ? 0 : response.data);
    
            const newEntry = {
                id: Date.now(),
                fileName: file.name,
                score: score.atsScore,
                date: new Date().toLocaleDateString()
            };
    
            // Update history with newest first (descending by id)
            const updatedHistory = [...history, newEntry].sort((a, b) => b.id - a.id);
            
            setHistory(updatedHistory);
            
            try {
                localStorage.setItem('uploadHistory', JSON.stringify(updatedHistory));
            } catch (err) {
                // Silent error handling
            }
    
            setScore(score);
            navigate('/scoredisplay');
    
        } catch (error) {
            setError('Error analyzing resume. Try again.');
            setIsLoading(false);
            return;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteHistoryItem = (id) => {
        setHistory(prevHistory => {
            const updatedHistory = prevHistory.filter(item => item.id !== id);
            try {
                localStorage.setItem('uploadHistory', JSON.stringify(updatedHistory));
            } catch (err) {
                // Silent error handling
            }

            if (selectedHistoryItemId === id) {
                setSelectedHistoryItem(null);
                setSelectedHistoryItemId(null);
            }
            return updatedHistory;
        });
    };

    const clearHistory = () => {
        localStorage.removeItem('uploadHistory');
        setHistory([]);
        setCurrentPage(1);
        setSelectedHistoryItem(null);
        setSelectedHistoryItemId(null);
        setTotalPages(1);
    };

    const goToNextPage = () => {
        setCurrentPage(Math.min(currentPage + 1, totalPages));
    };

    const goToPreviousPage = () => {
        setCurrentPage(Math.max(currentPage - 1, 1));
    };

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = history.slice(indexOfFirstEntry, indexOfLastEntry);

    const selectHistoryItem = (item) => {
        if (selectedHistoryItemId === item.id) {
            setSelectedHistoryItem(null);
            setSelectedHistoryItemId(null);
        } else {
            setSelectedHistoryItem(item);
            setSelectedHistoryItemId(item.id);
        }
    };

    // Helper function to determine score color
    function getScoreColor(score) {
        if (score >= 80) return '#2ecc71'; // Green
        if (score >= 60) return '#f39c12'; // Orange
        return '#e74c3c'; // Red
    }

    // Helper function to generate recommendations based on score
    function getRecommendations(score) {
        if (score >= 80) {
            return [
                { text: 'Your resume is ATS-friendly and well-optimized.', color: '#2ecc71' },
                { text: 'Consider adding more measurable achievements to stand out even more.', color: '#3498db' },
                { text: 'Customize slightly for each specific job application.', color: '#3498db' }
            ];
        } else if (score >= 60) {
            return [
                { text: 'Your resume is moderately ATS-friendly but needs improvement.', color: '#f39c12' },
                { text: 'Consider using more industry-specific keywords from the job descriptions.', color: '#f39c12' },
                { text: 'Improve formatting to ensure better ATS compatibility.', color: '#f39c12' },
                { text: 'Use standard section headings (Experience, Education, Skills, etc.).', color: '#3498db' }
            ];
        } else {
            return [
                { text: 'Your resume needs significant improvements for ATS compatibility.', color: '#e74c3c' },
                { text: 'Avoid using tables, headers, footers, and complex formatting.', color: '#e74c3c' },
                { text: 'Use a single-column layout for better ATS parsing.', color: '#e74c3c' },
                { text: 'Include more relevant keywords from job descriptions.', color: '#f39c12' },
                { text: 'Use standard section headings and bullet points.', color: '#f39c12' }
            ];
        }
    }

    return (
        <div className="uploader-container">
            <div className="three-column-layout">
                {/* Left Column - History */}
                <div className="history-column" ref={historyColumnRef} style={{ height: columnHeight }}>
                    <div className={`history-header ${history.length === 0 ? 'history-header-center' : ''}`}>
                        <h3>Upload History</h3>
                        {history.length > 0 && (
                            <button className="clear-history-btn" onClick={clearHistory}>
                                Clear All ({history.length})
                            </button>
                        )}
                    </div>
                    {history.length > 0 ? (
                        <>
                            <ul className="history-list">
                                {currentEntries.map((item) => (
                                    <li
                                        key={item.id}
                                        className={`history-item ${selectedHistoryItemId === item.id ? 'selected' : ''}`}
                                        onClick={() => selectHistoryItem(item)}
                                    >
                                        <div className="history-item-content">
                                            <span className="history-filename">{item.fileName}</span>
                                            <span className="history-score"> Score: <strong>{item.score}</strong></span>
                                            {item.date && (
                                                <>
                                                    <span> </span>
                                                    <span className="history-date">{item.date}</span>
                                                </>
                                            )}
                                        </div>
                                        <button className="delete-btn" onClick={(e) => {
                                            e.stopPropagation();
                                            deleteHistoryItem(item.id);
                                        }}>
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            {totalPages > 1 && (
                                <div className="pagination-controls">
                                    <button onClick={goToPreviousPage} disabled={currentPage === 1}>
                                        ← Prev
                                    </button>
                                    <span>{currentPage}/{totalPages}</span>
                                    <button onClick={goToNextPage} disabled={currentPage === totalPages}>
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-history">
                            <p>No upload history available</p>
                        </div>
                    )}
                </div>

                {/* Middle Column - Uploader */}
                <div className="uploader-column" ref={uploaderColumnRef} style={{ height: columnHeight }}>
                    <h2 className="logo-heading">Resume Analyzer</h2>
                    <form
                        className="file-uploader"
                        onDragEnter={handleDrag}
                        onSubmit={handleSubmit}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            onChange={handleChange}
                            accept=".pdf,.doc,.docx"
                            className="input-file"
                        />
                        <label
                            htmlFor="file-upload"
                            className={`upload-label ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {file ? (
                                <div className="file-info">
                                    <p className="file-name">{file.name}</p>
                                    <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            ) : (
                                <div className="upload-prompt">
                                    <FontAwesomeIcon icon="file-alt" className="upload-icon" />
                                    <p>Drag & drop your resume here or click to browse</p>
                                    <p className="file-types">Supported formats: PDF, DOC, DOCX</p>
                                </div>
                            )}
                        </label>
                        <textarea
                            className="job-description-input"
                            placeholder="Paste the job description here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                        <input
                            type="text"
                            className="job-location-input"
                            placeholder="Enter job location (e.g., City, State)"
                            value={jobLocation}
                            onChange={(e) => setJobLocation(e.target.value)} 
                        />
                        <input
                            type="text"
                            className="job-role-input"
                            placeholder="Enter job role (e.g., Software Engineer)"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}       
                        />    
                    </form>
                    <button
                        type="submit"
                        className="analyze-btn"
                        disabled={!file || isLoading}
                        onClick={handleSubmit}
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze Resume'}
                    </button>
                </div>

                {/* Right Column - Insights */}
                <div className="insights-column" ref={insightsColumnRef} style={{ height: columnHeight }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#333' }}>Resume Insights</h3>
                    {selectedHistoryItem ? (
                        <div className="insights-content">
                            <div className="insights-header">
                                <h4>{selectedHistoryItem.fileName}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Uploaded: {selectedHistoryItem.date}</span>
                                    <span>Score: <strong>{selectedHistoryItem.score}</strong></span>
                                </div>
                            </div>
                            <div className="score-visualization">
                                <h4>ATS Compatibility Score</h4>
                                <div className="score-bar-container">
                                    <div className="score-bar" style={{ width: `${Math.min(Math.max(selectedHistoryItem.score, 0), 100)}%`, backgroundColor: getScoreColor(selectedHistoryItem.score) }}></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                    <span>0</span>
                                    <span>Score: {selectedHistoryItem.score}</span>
                                    <span>100</span>
                                </div>
                            </div>

                            <div className="recommendations">
                                <h4>Recommendations</h4>
                                {getRecommendations(selectedHistoryItem.score).map((rec, index) => (
                                    <div key={index} className="recommendation-item">
                                        <span style={{ color: rec.color }}>•</span>
                                        <p>{rec.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="no-selection">
                            <p>Select a resume from history to view insights</p>
                        </div>
                    )}
                </div>
            </div>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default ResumeUploader;