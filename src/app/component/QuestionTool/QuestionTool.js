"use client";

import React, { useState, useEffect, useRef } from "react";
import "./QuestionTool.css";

export default function QuestionTool() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseJSON, setResponseJSON] = useState([]); // Ensure initialized as an array
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const [OriginalQuestion, setOriginalQuestion] = useState("");
  const [MarkScheme, setMarkScheme] = useState("");
  const [ExaminerReport, setExaminerReport] = useState("");
  const QtextareaRef = useRef(null);
  const MStextareaRef = useRef(null);
  const ERtextareaRef = useRef(null);
  const [ContextArea, setContext] = useState("");
  const [NumberOfVariations, setVariations] = useState("");
  const [images, setImages] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prevImages) => [...prevImages, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const SendQuery = () => {
    setShowSubmitButton(false);
    setLoading(true);

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
          const jsonMatch = data.response.match(/\[.*\]/); // Match JSON array
          if (jsonMatch) {
            const parsedJSON = JSON.parse(jsonMatch[0]); // Extract and parse
            setResponseJSON(Array.isArray(parsedJSON) ? parsedJSON : []);
          } else {
            console.error("No JSON array found in the response.");
            setResponseJSON([]);
          }
        } catch (error) {
          console.error("Error parsing response JSON:", error);
          setError(error);
          setResponseJSON([]); // Fallback to empty array
        } finally {
          setLoading(false);
          setShowSubmitButton(true);
        }
      })
      .catch((error) => {
        console.error("Error sending question:", error);
        setError(error);
        setLoading(false);
        setShowSubmitButton(true);
      });
  };

  return (
    <div className="question-tool-container">
      <div className="input-section">
        <label className="upload-label">
          Upload Images:
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="image-upload"
          />
        </label>

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
        {error && <p className="error-message">Error: {error.message}</p>}
      </div>

      {/* Always render the table */}
      <div className="response-section">
        <table className="response-table">
          <thead>
            <tr>
              <th>GroupID</th>
              <th>Topic</th>
              <th>Question Type</th>
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
              <th>K</th>
              <th>A</th>
              <th>A2</th>
              <th>EV</th>
              <th>Parent Group ID</th>
              <th>Part Number</th>
            </tr>
          </thead>
          <tbody>
            {responseJSON.length > 0
              ? responseJSON.map((item, index) => (
                  <tr key={index}>
                    <td>{item.GroupID || ""}</td>
                    <td>{item.Topic || ""}</td>
                    <td>{item.QuestionType || ""}</td>
                    <td>{item.Theme || ""}</td>
                    <td>{item.Marks || ""}</td>
                    <td>{item.Context || ""}</td>
                    <td>{item.Question || ""}</td>
                    <td>{item.Options?.join(", ") || ""}</td>
                    <td>{item.Answer || ""}</td>
                    <td>{item.ImageID || ""}</td>
                    <td>{item.Knowledge || ""}</td>
                    <td>{item.Application || ""}</td>
                    <td>{item.Analysis || ""}</td>
                    <td>{item.Evaluation || ""}</td>
                    <td>{item.K || ""}</td>
                    <td>{item.A || ""}</td>
                    <td>{item.A2 || ""}</td>
                    <td>{item.EV || ""}</td>
                    <td>{item.ParentGroupID || ""}</td>
                    <td>{item.PartNumber || ""}</td>
                  </tr>
                ))
              : // Render empty rows when JSON is empty
                Array.from({ length: 1 }, (_, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array.from({ length: 20 }, (_, colIndex) => (
                      <td key={colIndex}></td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
