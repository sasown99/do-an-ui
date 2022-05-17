//- ----------------------------------
//- 💥 DISPLACY ENT
//- ----------------------------------

"use strict";

export default class displaCyENT {
  constructor(api, options) {
    this.api = api;
    this.container = document.querySelector(options.container || "#displacy");

    this.defaultText =
      options.defaultText ||
      "When Sebastian Thrun started working on self-driving cars at Google in 2007, few people outside of the company took him seriously.";
    this.defaultModel = options.defaultModel || "en";
    this.defaultEnts = options.defaultEnts || [
      "person",
      "org",
      "gpe",
      "loc",
      "product",
    ];

    this.onStart = options.onStart || false;
    this.onSuccess = options.onSuccess || false;
    this.onError = options.onError || false;
    this.onRender = options.onRender || false;
  }

  parse(
    text = this.defaultText,
    model = this.defaultModel,
    ents = this.defaultEnts
  ) {
    if (typeof this.onStart === "function") this.onStart();

    let xhr = new XMLHttpRequest();
    xhr.open("POST", this.api, true);
    xhr.setRequestHeader("Content-type", "text/plain");
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        if (typeof this.onSuccess === "function") this.onSuccess();
        this.render(text, JSON.parse(xhr.responseText), ents);
      } else if (xhr.status !== 200) {
        if (typeof this.onError === "function") this.onError(xhr.statusText);
      }
    };

    xhr.onerror = () => {
      xhr.abort();
      if (typeof this.onError === "function") this.onError();
    };

    xhr.send(JSON.stringify({ text, model }));
  }

  render(datas, text, spans, ents) {
    this.container.innerHTML = "";
    datas.forEach((data) => {
      text = data.text;
      spans = data.entities;
      let offset = 0;

      spans.forEach(({ tag, start_position, end_position }) => {
        const entity = text.slice(start_position, end_position);
        const fragments = text.slice(offset, start_position).split("\n");

        fragments.forEach((fragment, i) => {
          this.container.appendChild(document.createTextNode(fragment));
          if (fragments.length > 1 && i != fragments.length - 1)
            this.container.appendChild(document.createElement("br"));
        });

        if (ents.includes(tag.toLowerCase())) {
          let mark = document.createElement("mark");
          if (tag.toLowerCase() === "code") {
            mark = document.createElement("a");
            mark.setAttribute(
              "href",
              `http://127.0.0.1:3000/${entity.replaceAll("/", "_")}`
            );
            mark.setAttribute("target", "_blank");
            mark.setAttribute("rel", "noreferrer noopener");
          }
          mark.setAttribute("data-entity", tag.toLowerCase());
          mark.appendChild(document.createTextNode(entity));
          this.container.appendChild(mark);
        } else {
          this.container.appendChild(document.createTextNode(entity));
        }

        offset = end_position;
      });

      this.container.appendChild(
        document.createTextNode(text.slice(offset, text.length))
      );
      this.container.appendChild(document.createElement("br"));
    });

    // console.log(
    //   `%c💥  HTML markup\n%c<div class="entities">${this.container.innerHTML}</div>`,
    //   "font: bold 16px/2 arial, sans-serif",
    //   'font: 13px/1.5 Consolas, "Andale Mono", Menlo, Monaco, Courier, monospace'
    // );

    if (typeof this.onRender === "function") this.onRender();
  }
}
