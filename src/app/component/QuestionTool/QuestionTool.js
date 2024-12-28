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
  const [images, setImages] = useState([]);
  const QtextareaRef = useRef(null);
  const MStextareaRef = useRef(null);
  const ERtextareaRef = useRef(null);

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

  useEffect(() => {
    // Log the responseJSON to debug
    console.log("responseJSON:", responseJSON);
  }, [responseJSON]);

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
      </div>

      <div className="response-section">
        {responseJSON.length > 0 ? (
          <table className="response-table">
            <thead>
              <tr>
                <th>GroupID</th>
                <th>Topic</th>
                <th>QuestionType</th>
                <th>Marks</th>
                <th>Question</th>
                <th>Answer</th>
                <th>Criteria</th>
                <th>Context</th>
                <th>Knowledge</th>
                <th>Application</th>
                <th>Analysis</th>
                <th>Evaluation</th>
                <th>ImageID</th>
                <th>WorkingOut</th>
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
                  <td>{item.Marks}</td>
                  <td>{item.Question}</td>
                  <td>{item.Answer}</td>
                  <td>{item.Criteria}</td>
                  <td>{item.Context}</td>
                  <td>{item.Knowledge}</td>
                  <td>{item.Application}</td>
                  <td>{item.Analysis}</td>
                  <td>{item.Evaluation}</td>
                  <td>{item.ImageID}</td>
                  <td>{item.WorkingOut}</td>
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
