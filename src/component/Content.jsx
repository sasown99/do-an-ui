import React, { useEffect, useRef, useState } from "react";
import "../assets/css/content.scss";
import "../assets/css/utils.scss";
import displaCyENT from "../displacy-ent/assets/js/displacy-ent.js";
import Select from "react-select";
import axios from "axios";
import { savePDF } from "@progress/kendo-react-pdf";
import LoadingSpinner from "./LoadingSpinner";

let dataReceived = [];
let dataUpload = "";
let titleDoc = "";
let fileName = "";

export default function Content() {
  const [legalOptions, setLegalOptions] = useState([]);
  const [idLaw, setIdLaw] = useState(0);
  const [idLawSend, setIdLawSend] = useState(0);
  const [entities, setEntities] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const refs = useRef([]);
  const contentArea = useRef(null);

  const selectedOption = legalOptions.find((option) => option.value === idLaw);

  const handleChange = (e) => {
    if (e.target.checked) {
      setEntities([...entities, e.target.value]);
    } else {
      let array = entities;
      array.splice(array.indexOf(e.target.value), 1);
      setEntities([...array]);
    }
  };

  const handleSelectOptionChange = (selectedOption) => {
    const selectedValue = selectedOption
      ? selectedOption.value
      : selectedOption;
    setIdLaw(selectedValue);
  };

  const handleCheckedChange = () => {
    setIsChecked(!isChecked);
  };

  const handleClickButtonSend = async () => {
    if (!isLoading) {
      if (
        isChecked &&
        legalOptions.some((option) => {
          return option.label === fileName.split(".txt")[0];
        })
      ) {
        alert("Eror message : This file already exists");
      } else if (isChecked && dataUpload !== "" && fileName !== "") {
        setIsLoading(true);
        let sentences = [];
        // Split raw data into array
        const array = dataUpload.match(/[^\r\n]+/g);
        sentences = array.map((sentence) => ({
          text: sentence,
        }));
        // send data to API
        try {
          const response = await axios({
            method: "post",
            url: "http://127.0.0.1:8000/ner",
            header: {
              "Content-Type": "application/json",
            },
            data: {
              sentences,
              fileName,
            },
          });
          dataReceived = response.data.result;
          setIsLoading(false);
        } catch (error) {
          console.log(error);
        }
        titleDoc = fileName.split(".")[0];
      } else {
        titleDoc = selectedOption?.label;
      }
      setIdLawSend((pre) => pre + 1);
    }
  };

  useEffect(() => {
    if (isChecked) {
      const actualBtn = document.getElementById("actual-btn");

      const fileChosen = document.getElementById("file-chosen");

      if (actualBtn) {
        actualBtn.addEventListener("change", function (event) {
          fileChosen.textContent = this.files[0].name;
          fileName = this.files[0].name;
          if (fileName.includes(".txt")) {
            const input = event.target;
            if ("files" in input && input.files.length > 0) {
              placeFileContent(input.files[0]);
            }
          } else {
            alert("Error message: please choose text file (.txt)");
          }
        });
      }
    } else {
      const getAllFiles = async () => {
        const url = `http://127.0.0.1:8000/getAllFiles`;
        const response = await axios.get(url);
        setLegalOptions(response.data.result);
      };
      getAllFiles();
    }
  }, [isChecked]);

  function placeFileContent(file) {
    readFileContent(file)
      .then((content) => {
        dataUpload = content;
      })
      .catch((error) => console.log(error));
  }

  function readFileContent(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  const handleCheckAll = (e) => {
    refs.current.forEach((checkbox) => {
      checkbox.checked = true;
    });
    setEntities([
      "code",
      "date",
      "org",
      "per",
      "pertype",
      "link",
      "crime",
      "penalty",
    ]);
  };

  useEffect(() => {
    //Your API
    const api = "http://localhost:3000";

    // Init displaCY ENT
    const displacy = new displaCyENT(api, {
      container: "#displacy",
      defaultText:
        "When Sebastian Thrun started working on self-driving cars at Google in 2007, few people outside of the company took him seriously.",
      defaultEnts: ["person", "org", "date"],
    });
    if (isChecked) {
      displacy.render(dataReceived, "", [], entities);
    } else if (selectedOption) {
      const loadFile = async () => {
        const url = `http://127.0.0.1:8000/loadFile?fileName=${selectedOption.label}`;
        const response = await axios.get(url);
        dataReceived = response.data.result;
        displacy.render(dataReceived, "", [], entities);
      };
      loadFile();
    }
  }, [idLawSend]);

  useEffect(() => {
    //Your API
    const api = "http://localhost:3000";

    // Init displaCY ENT
    const displacy = new displaCyENT(api, {
      container: "#displacy",
      defaultText:
        "When Sebastian Thrun started working on self-driving cars at Google in 2007, few people outside of the company took him seriously.",
      defaultEnts: ["person", "org", "date"],
    });
    if (dataReceived) {
      displacy.render(dataReceived, "", [], entities);
    }
  }, [entities]);
  const handleExport = (event) => {
    savePDF(contentArea.current, {
      paperSize: "A4",
      fileName: `${titleDoc}.pdf`,
      landscape: true,
    });
  };

  useEffect(() => {
    let pathName = window.location.pathname.substring(1).trim();
    if (pathName) {
      let textName = "";
      if (pathName.includes("%")) {
        pathName = pathName.split("%")[0];
      }

      const getAllFiles = async () => {
        const url = `http://127.0.0.1:8000/getAllFiles`;
        const response = await axios.get(url);
        response.data.result.forEach((option) => {
          if (option.label.includes(pathName)) textName = option.label;
        });
        titleDoc = "Not Found The Legal Document";
        if (textName) {
          //Your API
          const api = "http://localhost:3000";

          // Init displaCY ENT
          const displacy = new displaCyENT(api, {
            container: "#displacy",
            defaultText:
              "When Sebastian Thrun started working on self-driving cars at Google in 2007, few people outside of the company took him seriously.",
            defaultEnts: ["person", "org", "date"],
          });
          const loadFile = async () => {
            const url = `http://127.0.0.1:8000/loadFile?fileName=${textName}`;
            const response = await axios.get(url);
            dataReceived = response.data.result;
            titleDoc = textName;
            handleCheckAll();
            displacy.render(dataReceived, "", [], entities);
          };
          loadFile();
        }
        if (titleDoc === "Not Found The Legal Document") handleCheckAll();
      };

      getAllFiles();
    }
    handleCheckAll();
  }, []);

  return (
    <div className="s-content">
      <article data-demo="displacy-ent">
        <header className="s-header s-wrapper t-wrapper">
          <h1 className="s-h1">
            Demo Named Entity Recognition <br /> In Legal Documents
          </h1>
          <div className="s-grid s-grid--half">
            <div className="s-input-control">
              <div className="s-input">
                <label className="legal-text">
                  Legal Documents (&nbsp;Upload your file &nbsp;
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={handleCheckedChange}
                    />
                    <span className="slider round"></span>
                  </label>
                  &nbsp;)
                </label>
                <div className="s-input--wrapper">
                  {!isChecked && (
                    <Select
                      id="legal-text"
                      className="s-select"
                      placeholder="Please select legal document ..."
                      onChange={handleSelectOptionChange}
                      options={legalOptions}
                    />
                  )}

                  {isChecked && (
                    <>
                      <input type="file" id="actual-btn" accept=".txt" hidden />
                      <label id="file-label" htmlFor="actual-btn">
                        Choose File
                      </label>
                      <span id="file-chosen">No file chosen</span>
                    </>
                  )}
                </div>
              </div>
              <div className="btn">
                <button className="btn-send" onClick={handleClickButtonSend}>
                  Search
                </button>
              </div>
            </div>
            <div className="s-entity-label">
              <label className="legal-text">
                Entity labels (
                <a className="s-a" onClick={handleCheckAll}>
                  select all
                </a>
                )
              </label>
              <div>
                <label htmlFor="code" className="s-input__option">
                  <input
                    type="checkbox"
                    id="code"
                    value="code"
                    className="s-input__option__box"
                    onClick={handleChange}
                    ref={(element) => {
                      refs.current[0] = element;
                    }}
                  />
                  <span className="s-input__option__value">CODE</span>
                </label>
                <label htmlFor="date" className="s-input__option">
                  <input
                    type="checkbox"
                    id="date"
                    value="date"
                    className="s-input__option__box"
                    onClick={handleChange}
                    ref={(element) => {
                      refs.current[1] = element;
                    }}
                  />
                  <span className="s-input__option__value">DATE</span>
                </label>
                <label htmlFor="org" className="s-input__option">
                  <input
                    type="checkbox"
                    id="org"
                    value="org"
                    className="s-input__option__box"
                    onClick={handleChange}
                    ref={(element) => {
                      refs.current[2] = element;
                    }}
                  />
                  <span className="s-input__option__value">ORG</span>
                </label>
                <label htmlFor="per" className="s-input__option">
                  <input
                    type="checkbox"
                    id="per"
                    value="per"
                    className="s-input__option__box"
                    onClick={handleChange}
                    ref={(element) => {
                      refs.current[3] = element;
                    }}
                  />
                  <span className="s-input__option__value">PER</span>
                </label>
                <label htmlFor="pertype" className="s-input__option">
                  <input
                    type="checkbox"
                    id="pertype"
                    value="pertype"
                    className="s-input__option__box"
                    onClick={handleChange}
                    ref={(element) => {
                      refs.current[4] = element;
                    }}
                  />
                  <span className="s-input__option__value">PERTYPE</span>
                </label>
                <label htmlFor="link" className="s-input__option">
                  <input
                    type="checkbox"
                    id="link"
                    value="link"
                    className="s-input__option__box"
                    onClick={handleChange}
                    ref={(element) => {
                      refs.current[5] = element;
                    }}
                  />
                  <span className="s-input__option__value">LINK</span>
                </label>
                <label htmlFor="crime" className="s-input__option">
                  <input
                    type="checkbox"
                    id="crime"
                    value="crime"
                    className="s-input__option__box"
                    onClick={handleChange}
                    ref={(element) => {
                      refs.current[6] = element;
                    }}
                  />
                  <span className="s-input__option__value">CRIME</span>
                </label>
                <label htmlFor="penalty" className="s-input__option">
                  <input
                    type="checkbox"
                    id="penalty"
                    value="penalty"
                    className="s-input__option__box"
                    onClick={handleChange}
                    ref={(element) => {
                      refs.current[7] = element;
                    }}
                  />
                  <span className="s-input__option__value">PENALTY</span>
                </label>
              </div>
            </div>
          </div>
        </header>
        <section className="s-content t-wrapper s-legal-content">
          {isLoading || (
            <div className="s-legal-title">
              {titleDoc || "Please Choose Legal Documents !!!"}
              {titleDoc && titleDoc !== "Not Found The Legal Document" && (
                <button
                  className="btn-download"
                  onClick={handleExport}
                  title="download this document"
                >
                  <i className="fa fa-download"></i>
                </button>
              )}
            </div>
          )}
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div id="displacy" className="s-legal-text" ref={contentArea}></div>
          )}
        </section>
      </article>
    </div>
  );
}
