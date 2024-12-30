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
  const [images, setImages] = useState([]);  // Store files here (not URLs)
  const [fileCount, setFileCount] = useState(0); // To store the count of uploaded files
  const QtextareaRef = useRef(null);
  const MStextareaRef = useRef(null);
  const ERtextareaRef = useRef(null);

  const handleImageUpload = (e) => {
    e.preventDefault();
    const newFiles = Array.from(e.target.files); // Get the new files from the file input

    // Filter out duplicates based on file name and size
    const uniqueFiles = newFiles.filter(file => {
      return !images.some(existingFile => existingFile.name === file.name && existingFile.size === file.size);
    });

    if (uniqueFiles.length > 0) {
      // Append the new unique files to the existing ones in the images array
      setImages((prevImages) => [
        ...prevImages,
        ...uniqueFiles,
      ]);

      // Update the file count with the number of new unique files added
      setFileCount((prevCount) => prevCount + uniqueFiles.length);
    }
  };

  // Remove an uploaded image file
  const removeFile = (fileToRemove) => {
    // Filter out the file to remove from the images array
    const updatedImages = images.filter(file => file.name !== fileToRemove.name || file.size !== fileToRemove.size);
    
    setImages(updatedImages);
    setFileCount(updatedImages.length);  // Update the file count after removal
  };

  const SendQuery = () => {
    setShowSubmitButton(false);
    setLoading(true);
    setError(null);

    const payload = {
      OriginalQuestion,
      MarkScheme,
      ExaminerReport,
      ContextArea,
      NumberOfVariations,
      Images: images,  // Images will now hold the actual file objects
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
          const cleanedResponse = data.response.replace(/\n/g, "").trim();
          const jsonMatch = cleanedResponse.match(/\[.*\]/);
          if (jsonMatch) {
            const parsedJSON = JSON.parse(cleanedResponse);
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

  const handleCopyToClipboard = () => {
    if (responseJSON.length === 0) return;

    const rows = responseJSON.map((item) => [
      item.GroupID, item.Topic, item.QuestionType, item.Theme, item.Marks, item.Context,
      item.Question, item.Options, item.Answer, item.ImageID, item.Knowledge, item.Application,
      item.Analysis, item.Evaluation, item.WorkingOut, item.Criteria, item.K, item.A, item.A2,
      item.EV, item.ParentGroupID, item.PartNumber
    ]);

    const csvContent = rows
      .map((row) => row.join("\t"))
      .join("\n");

    navigator.clipboard.writeText(csvContent)
      .then(() => {
        alert("Table rows copied to clipboard!");
      })
      .catch((err) => {
        console.error("Error copying to clipboard", err);
      });
  };

  useEffect(() => {
    console.log("responseJSON:", responseJSON);
  }, [responseJSON]);

  return (
    <div className="question-tool-container">
      <div className="input-section">
        <div className="image-upload-section">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden-file-input"
          />

          {images.length > 0 && (
            <div className="uploaded-files">
              <h4>Uploaded Files:</h4>
              <ul>
                {images.map((file, index) => (
                  <li key={index}>
                    {file.name}{" "}
                    <button onClick={() => removeFile(file)} className="remove-button">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
