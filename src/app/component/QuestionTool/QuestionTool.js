"use client";

import React, { useState, useEffect, useRef } from "react";
import "./QuestionTool.css";

export default function QuestionTool() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseJSON, setResponseJSON] = useState([]);
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const [OriginalQuestion, setOriginalQuestion] = useState("");
  const [MarkScheme, setMarkScheme] = useState("");
  const [ExaminerReport, setExaminerReport] = useState("");
  const [ContextArea, setContext] = useState("");
  const [NumberOfVariations, setVariations] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState([]);
  const QtextareaRef = useRef(null);
  const MStextareaRef = useRef(null);
  const ERtextareaRef = useRef(null);

  const handleImageUpload = (e) => {
    e.preventDefault(); // Prevent default behavior, especially for drag-and-drop
  
    let files = [];
    
    // Check if it's a drag-and-drop event (from e.dataTransfer)
    if (e.dataTransfer && e.dataTransfer.files) {
      files = Array.from(e.dataTransfer.files);
    }
    // Check if it's a file input change event (from e.target.files)
    else if (e.target && e.target.files) {
      files = Array.from(e.target.files);
    } else {
      console.error("No files found in event.");
      return;
    }
  
    // Process each file
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prevImages) => [...prevImages, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); // Prevent browser from opening the file
    setIsDragging(false);
    handleImageUpload(e); // Pass the event to the handler
  };

  const SendQuery = () => {
    setShowSubmitButton(false);
    setLoading(true);
    setError(null); // Reset error before making a new request

    const payload = {
      OriginalQuestion,
      MarkScheme,
      ExaminerReport,
      ContextArea,
      NumberOfVariations,
      Images: images,
    };

    fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        try {
          const cleanedResponse = data.response.replace(/\n/g, '').trim();
          const jsonMatch = cleanedResponse.match(/\[.*\]/); // Match JSON array
          if (jsonMatch) {
            const parsedJSON = JSON.parse(cleanedResponse); // Extract and parse
            setResponseJSON(Array.isArray(parsedJSON) ? parsedJSON : []);
          } else {
            console.error("Not enough context given.");
            setResponseJSON([]);
          }
        } catch (error) {
          console.error("Error parsing response JSON:", error.message);
          setError(error.message);
          setResponseJSON([]);
        } finally {
          setLoading(false);
          setShowSubmitButton(true);
        }
      })
      .catch((error) => {
        console.error("Error sending question:", error.message);
        setError(error.message);
        setLoading(false);
        setShowSubmitButton(true);
      });
  };

  // Function to format the table rows as CSV
  const handleCopyToClipboard = () => {
    if (responseJSON.length === 0) return; // No data to copy
  
    const rows = responseJSON.map(item => [
      item.GroupID, item.Topic, item.QuestionType, item.Theme, item.Marks, item.Context,
      item.Question, item.Options, item.Answer, item.ImageID, item.Knowledge, item.Application,
      item.Analysis, item.Evaluation, item.WorkingOut, item.Criteria, item.K, item.A, item.A2,
      item.EV, item.ParentGroupID, item.PartNumber
    ]);
  
    const csvContent = rows
      .map(row => row.join("\t"))  // Join each row with tabs
      .join("\n");  // Join all rows with newlines
  
    // Copy to clipboard
    navigator.clipboard.writeText(csvContent)
      .then(() => {
        alert("Table rows copied to clipboard! You can now paste them into Excel.");
      })
      .catch((err) => {
        console.error("Error copying to clipboard", err);
      });
  };
  

  useEffect(() => {
    // Log the responseJSON to debug
    console.log("responseJSON:", responseJSON);
  }, [responseJSON]);

  return (
    <div className="question-tool-container">
      <div className="input-section">
        <div
          className={`drag-and-drop-area ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p>Drag and drop files here or click 'Choose files' to select</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}  // Pass the whole event
            className="hidden-file-input"
          />
        </div>

        <label className="context-label">
          Context Area:
          <input
            type="text"
            placeholder="Enter context area"
            value={ContextArea}
            onChange={(e) => setContext(e.target.value)}
            className="context-input"
          />
        </label>

        <label className="variations-label">
          Number of Variations:
          <input
            type="text"
            placeholder="Enter the number of variations you want"
            value={NumberOfVariations}
            onChange={(e) => setVariations(e.target.value)}
            className="variations-input"
          />
        </label>

        <label className="question-label">
          Original Question:
          <textarea
            className="q-input"
            ref={QtextareaRef}
            placeholder="Enter the question"
            onChange={(e) => setOriginalQuestion(e.target.value)}
          />
        </label>

        <label className="mark-scheme-label">
          Mark Scheme:
          <textarea
            className="ms-input"
            ref={MStextareaRef}
            placeholder="Enter the Mark Scheme"
            onChange={(e) => setMarkScheme(e.target.value)}
          />
        </label>

        <label className="examiner-report-label">
          Examiner Report:
          <textarea
            className="er-input"
            ref={ERtextareaRef}
            placeholder="Enter the Examiners Report"
            onChange={(e) => setExaminerReport(e.target.value)}
          />
        </label>
      </div>

      <div className="button-section">
        {showSubmitButton && (
          <button className="submit-button" onClick={SendQuery}>
            Submit
          </button>
        )}
        {loading && <p className="loading-text">Loading...</p>}
        {responseJSON.length > 0 && (
          <button className="copy-button" onClick={handleCopyToClipboard}>
            Copy to Clipboard
          </button>
        )}
      </div>

      <div className="response-section">
        {responseJSON.length > 0 ? (
          <table className="response-table">
            <thead>
              <tr>
                <th>GroupID</th>
                <th>Topic</th>
                <th>QuestionType</th>
                <th>Theme</th>
                <th>Marks</th>
                <th>Context</th>
                <th>Question</th>
                <th>Options</th>
                <th>Answer</th>
                <th>ImageID</th>
                <th>Knowledge</th>
                <th>Application</th>
                <th>Analysis</th>
                <th>Evaluation</th>
                <th>WorkingOut</th>
                <th>Criteria</th>
                <th>K</th>
                <th>A</th>
                <th>A2</th>
                <th>Ev</th>
                <th>ParentGroupID</th>
                <th>PartNumber</th>
              </tr>
            </thead>
            <tbody>
              {responseJSON.map((item, index) => (
                <tr key={index}>
                  <td>{item.GroupID}</td>
                  <td>{item.Topic}</td>
                  <td>{item.QuestionType}</td>
                  <td>{item.Theme}</td>
                  <td>{item.Marks}</td>
                  <td>{item.Context}</td>
                  <td>{item.Question}</td>
                  <td>{item.Options}</td>
                  <td>{item.Answer}</td>
                  <td>{item.ImageID}</td>
                  <td>{item.Knowledge}</td>
                  <td>{item.Application}</td>
                  <td>{item.Analysis}</td>
                  <td>{item.Evaluation}</td>
                  <td>{item.WorkingOut}</td>
                  <td>{item.Criteria}</td>
                  <td>{item.K}</td>
                  <td>{item.A}</td>
                  <td>{item.A2}</td>
                  <td>{item.EV}</td>
                  <td>{item.ParentGroupID}</td>
                  <td>{item.PartNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !loading && <p>No data available to display.</p>
        )}
        {error && <p className="error-text">Error: {error}</p>}
      </div>
    </div>
  );
}
