//client/src/components/ScoreDisplay.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ScoreDisplay.css';

const ScoreDisplay = ({ score, fileName, setFileName, setScore }) => {
    const {
        atsScore,
        keywordScore,
        skillScore,
        experienceScore,
        formattingScore,
        grammarScore,
        resumeLengthScore,
        recommendations = [],
        keywordMatches = [],
        formattingIssues = [],
        experienceGapAnalysis = [],
        skillGaps = [],
        quantifiableAchievements = [],
        actionVerbs = [],
        resumeLength = '',
        customSections = [],
        summaryAnalysis = [],
        educationAnalysis = [],
        contactInformation = [],
        technicalSkills = [],
        softSkills = [],
        certifications = [],
        awards = [],
        projects = [],
        leadership = [],
        publications = [],
        volunteerExperience = [],
        militaryExperience = [],
        references = [],
        grammar = [],
        buzzwords = [],
        negativeKeywords = [],
        job_suggestions = []
    } = score || {};

    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Adjust breakpoint as needed

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); // Adjust breakpoint as needed
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Filter out placeholder keywords
    const filteredKeywordMatches = keywordMatches.filter(keyword =>
        !['your', 'job', 'description', 'here'].includes(keyword.term.toLowerCase())
    );

    const getScoreColorClass = (scoreValue) => {
        if (scoreValue >= 90) return 'score-high';
        if (scoreValue >= 75) return 'score-medium';
        if (scoreValue >= 60) return 'score-medium-low';
        return 'score-low';
    };

    // Function to calculate keyword match percentage
    const calculateKeywordMatchPercentage = () => {
        if (!filteredKeywordMatches || filteredKeywordMatches.length === 0) return 0;
        const matchedCount = filteredKeywordMatches.filter(keyword => keyword.found).length;
        return Math.round((matchedCount / filteredKeywordMatches.length) * 100);
    };

    // Function to reset the state and navigate back
    const handleUploadAnother = () => {
        setScore(null); // Reset the score
        setFileName(''); // Reset the fileName
        navigate('/'); // Navigate back to the ResumeUploader
    };

    // Function to determine keyword match strength
    const getKeywordMatchStrength = (frequency) => {
        if (frequency >= 3) return 'strong-match';
        if (frequency === 2) return 'moderate-match';
        return 'weak-match';
    };

    return (
        <div className="score-container">
            <h2>ATS Analysis Results for {fileName}</h2>

            <div className="score-circle-container">
                <div className={`score-circle ${getScoreColorClass(atsScore)}`}>
                    <span className="score-number">{atsScore || 0}</span>
                    <span className="score-label">ATS Score</span>
                </div>
            </div>

            <div className="section-scores">
                <div className="section-score">
                    <span className="section-label">Keyword Relevance:</span>
                    <span className={`score ${getScoreColorClass(keywordScore)}`}>{keywordScore || 0}/100</span>
                </div>
                <div className="section-score">
                    <span className="section-label">Skills Matching:</span>
                    <span className={`score ${getScoreColorClass(skillScore)}`}>{skillScore || 0}/100</span>
                </div>
                <div className="section-score">
                    <span className="section-label">Experience & Accomplishments:</span>
                    <span className={`score ${getScoreColorClass(experienceScore)}`}>{experienceScore || 0}/100</span>
                </div>
                <div className="section-score">
                    <span className="section-label">Formatting & ATS Compatibility:</span>
                    <span className={`score ${getScoreColorClass(formattingScore)}`}>{formattingScore || 0}/100</span>
                </div>
                <div className="section-score">
                    <span className="section-label">Grammar & Writing Quality:</span>
                    <span className={`score ${getScoreColorClass(grammarScore)}`}>{grammarScore || 0}/100</span>
                </div>
                <div className="section-score">
                    <span className="section-label">Resume Length:</span>
                    <span className={`score ${getScoreColorClass(resumeLengthScore)}`}>{resumeLengthScore || 0}/100</span>
                </div>
            </div>

            <div className="analysis-sections">

                {filteredKeywordMatches.length > 0 && (
                    <div className="analysis-section">
                        <h3>Keyword Analysis</h3>
                        <p>Job-specific keywords were analyzed against your resume. You matched {calculateKeywordMatchPercentage()}% of expected keywords.</p>
                        <div className="keyword-match-stats">
                            <div className="keyword-match-stat">
                                <span className="stat-label">Found: </span>
                                <span className="stat-value">{filteredKeywordMatches.filter(k => k.found).length}</span>
                            </div>
                            <div className="keyword-match-stat">
                                <span className="stat-label">Missing: </span>
                                <span className="stat-value">{filteredKeywordMatches.filter(k => !k.found).length}</span>
                            </div>
                            <div className="keyword-match-stat">
                                <span className="stat-label">Total: </span>
                                <span className="stat-value">{filteredKeywordMatches.length}</span>
                            </div>
                        </div>
                        <table className="keyword-analysis-table">
                            <thead>
                                <tr>
                                    <th>Keyword</th>
                                    <th>  Status</th>
                                    <th>  Frequency</th>
                                    <th>  Placement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredKeywordMatches.map((keyword, index) => (
                                    <tr key={index} className={keyword.found ? 'keyword-found' : 'keyword-missing'}>
                                        <td>{keyword.term}</td>
                                        <td>
                                            <span className={`keyword-status ${keyword.found ? 'found' : 'missing'}`}>
                                                {keyword.found ? 'Found' : 'Missing'}
                                            </span>
                                        </td>
                                        <td>
                                            {keyword.found ? (
                                                <span className={`keyword-frequency ${getKeywordMatchStrength(keyword.frequency || 1)}`}>
                                                    {keyword.frequency || 1}
                                                </span>
                                            ) : ' - '}
                                        </td>
                                        <td>
                                            {keyword.found ? (
                                                keyword.placement || 'Content'
                                            ) : ' - '}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="keyword-tips">
                            <h4>Keyword Optimization Tips:</h4>
                            <ul>
                                <li>Critical keywords should appear in prominent sections (Summary, Skills, Job Titles)</li>
                                <li>Include variations of keywords (e.g., "manage," "managing," "management")</li>
                                <li>Aim for 1-3 mentions of important keywords throughout your resume</li>
                                <li>Missing keywords should be added if you have the relevant experience</li>
                            </ul>
                        </div>
                    </div>
                )}

                {negativeKeywords && negativeKeywords.length > 0 && (
                    <div className="analysis-section">
                        <h3>Potential Buzzwords/Overused Phrases</h3>
                        <p>The following phrases may be seen as generic or overused. Try to be more specific and use concrete examples to demonstrate your skills.</p>
                        <ul>
                            {negativeKeywords.map((word, index) => (
                                <li key={index}>{word}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {formattingIssues.length > 0 && (
                    <div className="analysis-section">
                        <h3>Formatting Issues</h3>
                        <p>These issues can impact the ATS's ability to parse your resume accurately. Correcting these errors is crucial. Higher Formatting scores indicate fewer issues.</p>
                        <ul>
                            {formattingIssues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {recommendations.length > 0 && (
                    <div className="analysis-section">
                        <h3>General Recommendations</h3>
                        <p>These recommendations are based on industry best practices and ATS optimization strategies.</p>
                        <ul>
                            {recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && experienceGapAnalysis.length > 0 && (
                    <div className="analysis-section">
                        <h3>Employment Gap Analysis</h3>
                        <p>Identified gaps in employment history. Addressing these proactively in your cover letter or resume demonstrates transparency.</p>
                        <ul>
                            {experienceGapAnalysis.map((gap, index) => (
                                <li key={index}>{gap}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && skillGaps.length > 0 && (
                    <div className="analysis-section">
                        <h3>Skill Gap Analysis</h3>
                        <p>Based on the job description, these skills appear to be missing or underemphasized. Highlight these skills to align with job requirements. Higher Skill scores mean better alignment.</p>
                        <ul>
                            {skillGaps.map((skill, index) => (
                                <li key={index}>{skill}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && quantifiableAchievements.length > 0 && (
                    <div className="analysis-section">
                        <h3>Quantifiable Achievement Feedback</h3>
                        <p>Quantifying achievements provides concrete evidence of impact. Improve accomplishments by adding metrics. Experience scores are affected by quantifiable achievements.</p>
                        <ul>
                            {quantifiableAchievements.map((achievement, index) => (
                                <li key={index}>{achievement}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && actionVerbs.length > 0 && (
                    <div className="analysis-section">
                        <h3>Action Verb Feedback</h3>
                        <p>Using strong action verbs showcases abilities effectively. Replace weak verbs for a more persuasive resume. Experience scores are affected by quantifiable achievements.</p>
                        <ul>
                            {actionVerbs.map((verb, index) => (
                                <li key={index}>{verb}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {resumeLength && (
                    <div className="analysis-section">
                        <h3>Resume Length</h3>
                        <p>{resumeLength}. Resume Length score reflects adherence to industry standards.</p>
                    </div>
                )}

                {!isMobile && customSections.length > 0 && (
                    <div className="analysis-section">
                        <h3>Custom Section Feedback</h3>
                        <p>Ensure custom sections are relevant and demonstrate your skills and experience.</p>
                        <ul>
                            {customSections.map((section, index) => (
                                <li key={index}>{section}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && summaryAnalysis.length > 0 && (
                    <div className="analysis-section">
                        <h3>Summary/Objective Analysis</h3>
                        <p>Ensure your summary is concise, compelling, and highlights key qualifications.</p>
                        <ul>
                            {summaryAnalysis.map((analysis, index) => (
                                <li key={index}>{analysis}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && educationAnalysis.length > 0 && (
                    <div className="analysis-section">
                        <h3>Education Section Analysis</h3>
                        <p>Review clarity and completeness of educational information. Include degrees, certifications, and relevant coursework.</p>
                        <ul>
                            {educationAnalysis.map((analysis, index) => (
                                <li key={index}>{analysis}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && contactInformation.length > 0 && (
                    <div className="analysis-section">
                        <h3>Contact Information Analysis</h3>
                        <p>Verify accurate, professional, and up-to-date contact information.</p>
                        <ul>
                            {contactInformation.map((info, index) => (
                                <li key={index}>{info}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && technicalSkills.length > 0 && (
                    <div className="analysis-section">
                        <h3>Technical Skills Analysis</h3>
                        <p>Highlight technical skills relevant to the job description. Use specific keywords and list proficiency levels.</p>
                        <ul>
                            {technicalSkills.map((skill, index) => (
                                <li key={index}>{skill}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && softSkills.length > 0 && (
                    <div className="analysis-section">
                        <h3>Soft Skills Analysis</h3>
                        <p>Provide examples of how you've demonstrated soft skills in your work experience.</p>
                        <ul>
                            {softSkills.map((skill, index) => (
                                <li key={index}>{skill}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && certifications.length > 0 && (
                    <div className="analysis-section">
                        <h3>Certifications Analysis</h3>
                        <p>Highlight relevant certifications, certification name, issuing organization, and date completed (or expected completion date).</p>
                        <ul>
                            {certifications.map((certification, index) => (
                                <li key={index}>{certification}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && awards.length > 0 && (
                    <div className="analysis-section">
                        <h3>Awards and Recognition Analysis</h3>
                        <p>Analysis of listed awards and recognition to show higher levels of performance.</p>
                        <ul>
                            {awards.map((award, index) => (
                                <li key={index}>{award}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && projects.length > 0 && (
                    <div className="analysis-section">
                        <h3>Projects Analysis</h3>
                        <p>Providing sufficient information about project and how it could apply to the work you'll be doing with them</p>
                        <ul>
                            {projects.map((project, index) => (
                                <li key={index}>{project}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && leadership.length > 0 && (
                    <div className="analysis-section">
                        <h3>Leadership Experience</h3>
                        <p>Including examples of where you've lead a team or led a project can show that you are capable and willing to lead and take on new challenges </p>
                        <ul>
                            {leadership.map((lead, index) => (
                                <li key={index}>{lead}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && publications.length > 0 && (
                    <div className="analysis-section">
                        <h3>Publications Analysis</h3>
                        <p>If you have any publications that are relevant to the field in which you are applying it will show a subject matter expertise in that area. </p>
                        <ul>
                            {publications.map((publication, index) => (
                                <li key={index}>{publication}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && volunteerExperience.length > 0 && (
                    <div className="analysis-section">
                        <h3>Volunteer Experience Analysis</h3>
                        <p>Any volunteer experience will show a level of social responsibility and can enhance your personal branding. </p>
                        <ul>
                            {volunteerExperience.map((vol, index) => (
                                <li key={index}>{vol}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && militaryExperience.length > 0 && (
                    <div className="analysis-section">
                        <h3>Military Experience Analysis</h3>
                        <p>Military service can mean that you are well trained in your field of expertise, and know how to follow directions and can make split second decisions that can be difficult. </p>
                        <ul>
                            {militaryExperience.map((military, index) => (
                                <li key={index}>{military}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && references.length > 0 && (
                    <div className="analysis-section">
                        <h3>References Analysis</h3>
                        <p>This section is to provide information on your references, how they know you and their contact information. </p>
                        <ul>
                            {references.map((reference, index) => (
                                <li key={index}>{reference}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && grammar.length > 0 && (
                    <div className="analysis-section">
                        <h3>Grammar and Spelling Check</h3>
                        <p>This section provides feedback on the grammar and spelling in your document, making sure it all is correct.</p>
                        <ul>
                            {grammar.map((gram, index) => (
                                <li key={index}>{gram}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isMobile && buzzwords.length > 0 && (
                    <div className="analysis-section">
                        <h3>Buzzword Analysis</h3>
                        <p>This is to check to make sure the resume is not too generic, as you want it to be unique and targeted in your role and field.</p>
                        <ul>
                            {buzzwords.map((buzz, index) => (
                                <li key={index}>{buzz}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            {job_suggestions && job_suggestions.length > 0 && (
    <div className="analysis-section">
        <h3>Recommended Job Opportunities</h3>
        <p>Based on your resume, these positions might be a good fit for your skills and experience:</p>
        <div className="job-suggestions-container">
            {job_suggestions.map((job, index) => (
                <div key={index} className="job-card">
                    <h4>{job.title}</h4>
                    <div className="job-details">
                        <p><strong>Company:</strong> {job.company}</p>
                        <p><strong>Location:</strong> {job.location}</p>
                        {job.salary && <p><strong>Salary Range:</strong> {job.salary}</p>}
                        <a 
                            href={job.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="view-job-btn"
                        >
                            View Job
                        </a>
                    </div>
                </div>
            ))}
        </div>
    </div>
)}
            <button className="upload-another-btn" onClick={handleUploadAnother}>
                Upload Another Resume
            </button>
        </div>
    );
};

export default ScoreDisplay;