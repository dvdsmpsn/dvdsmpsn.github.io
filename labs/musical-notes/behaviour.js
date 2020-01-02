var notes = [
  {
    name: "A",
    class: "ledger", // none || 'full', 'ledger',
    positions: {
      sharp: "1",
      natural: "1 + 2",
      flat: "2 + 3"
    }
  },

  {
    name: "B",
    class: "", // none || 'full', 'ledger',
    positions: {
      sharp: "??",
      natural: "2",
      flat: "1"
    }
  },

  {
    name: "C",
    class: "ledger", // none || 'full', 'ledger',
    positions: {
      sharp: "1 + 2 + 3",
      natural: "0",
      flat: "2 + 3"
    }
  },

  {
    name: "D",
    class: "", // none || 'full', 'ledger',
    positions: {
      sharp: "2 + 3",
      natural: "1 + 3",
      flat: "1 + 2 + 3"
    }
  },

  {
    name: "E",
    class: "full", // 'none || 'full', 'ledger',
    positions: {
      sharp: "??",
      natural: "1 + 2",
      flat: "2 + 3"
    }
  },

  {
    name: "F",
    class: "", // 'none || 'full', 'ledger',
    positions: {
      sharp: "2",
      natural: "1",
      flat: "??"
    }
  },

  {
    name: "G",
    class: "full", // 'none || 'full', 'ledger',
    positions: {
      sharp: "2 + 3",
      natural: "0",
      flat: "2"
    }
  },

  {
    name: "A",
    class: "", // 'none || 'full', 'ledger',
    positions: {
      sharp: "1",
      natural: "1 + 2",
      flat: "2 + 3"
    }
  },

  {
    name: "B",
    class: "full", // 'none || 'full', 'ledger',
    positions: {
      sharp: "",
      natural: "2",
      flat: "1"
    }
  },

  {
    name: "C",
    class: "", // 'none || 'full', 'ledger',
    positions: {
      sharp: "1 + 2",
      natural: "0",
      flat: ""
    }
  },

  {
    name: "D",
    class: "full", // 'none || 'full', 'ledger',
    positions: {
      sharp: "2",
      natural: "1",
      flat: "1+2"
    }
  },

  {
    name: "E",
    class: "", // 'none || 'full', 'ledger',
    positions: {
      sharp: "-",
      natural: "0",
      flat: "2"
    }
  },

  {
    name: "F",
    class: "full", // 'none || 'full', 'ledger',
    positions: {
      sharp: "2",
      natural: "1",
      flat: "-"
    }
  },

  {
    name: "G",
    class: "", // 'none || 'full', 'ledger',
    positions: {
      sharp: "2",
      natural: "0",
      flat: "2"
    }
  },

  {
    name: "A",
    class: "ledger", // 'none || 'full', 'ledger',
    positions: {
      sharp: "",
      natural: "",
      flat: ""
    }
  },

  {
    name: "B",
    class: "", // 'none || 'full', 'ledger',
    positions: {
      sharp: "",
      natural: "",
      flat: ""
    }
  },

  {
    name: "C",
    class: "ledger", // 'none || 'full', 'ledger',
    positions: {
      sharp: "",
      natural: "",
      flat: ""
    }
  }
];

let consoleNode, consoleNodeDesc, buttons;

const clickHandler = e => {
  const note = JSON.parse(e.target.dataset.note);
  console.log("click", note.positions, consoleNode, buttons);

  consoleNode.innerHTML = `${note.name}: ${note.positions.natural}`;
  consoleNodeDesc.innerHTML = `${note.name}&#9839;: ${note.positions.sharp} &nbsp; • &nbsp; ${note.name}&#9837;: ${note.positions.flat} `;

  Array.from(buttons).map(item => {
    item.setAttribute("data-focused", false);
  });
  e.target.setAttribute("data-focused", true);
};

window.onload = () => {
  const staff = document.getElementById("staff");
  notes.map(item => {
    const text = document.createTextNode(item.name);

    const note = document.createElement("button");
    note.setAttribute("type", "button");
    note.setAttribute("class", item.class);
    note.setAttribute("data-note", JSON.stringify(item));
    note.onclick = clickHandler;

    // note.onmouseup = e => {
    //   e.preventDefault();
    //   console.log("onmouseup", e);
    // };

    note.appendChild(text);
    staff.appendChild(note);
  });

  buttons = document.getElementsByTagName("button");
  consoleNode = document.getElementById("console-text");
  consoleNodeDesc = document.getElementById("console-text-desc");
};
