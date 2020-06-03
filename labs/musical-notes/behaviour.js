var notes = [
  {
    name: "G",
    class: "", // 'none || 'full', 'ledger',
    positions: {
      sharp: "2 + 3",
      natural: "1 + 3",
      flat: "1 + 2 + 3",
    },
  },
  {
    name: "A",
    class: "ledger", // none || 'full', 'ledger',
    positions: {
      sharp: "1",
      natural: "1 + 2",
      flat: "2 + 3",
    },
  },

  {
    name: "B",
    class: "", // none || 'full', 'ledger',
    positions: {
      sharp: "0 (C)",
      natural: "2",
      flat: "1",
    },
  },

  {
    name: "C",
    class: "ledger", // none || 'full', 'ledger',
    positions: {
      sharp: "1 + 2 + 3",
      natural: "0",
      flat: "2 + 3",
    },
  },

  {
    name: "D",
    class: "", // none || 'full', 'ledger',
    positions: {
      sharp: "2 + 3",
      natural: "1 + 3",
      flat: "1 + 2 + 3",
    },
  },

  {
    name: "E",
    class: "full", // 'none || 'full', 'ledger',
    positions: {
      sharp: "1",
      natural: "1 + 2",
      flat: "2 + 3",
    },
  },

  {
    name: "F",
    class: "", // 'none || 'full', 'ledger',
    positions: {
      sharp: "2",
      natural: "1",
      flat: "-",
    },
  },

  {
    name: "G",
    class: "full", // 'none || 'full', 'ledger',
    positions: {
      sharp: "2 + 3",
      natural: "0",
      flat: "2",
    },
  },

  {
    name: "A",
    class: "", // 'none || 'full', 'ledger',
    positions: {
      sharp: "1",
      natural: "1 + 2",
      flat: "2 + 3",
    },
  },

  {
    name: "B",
    class: "full", // 'none || 'full', 'ledger',
    positions: {
      sharp: "0 (C)",
      natural: "2",
      flat: "1",
    },
  },

  {
    name: "C",
    class: "", // 'none || 'full', 'ledger',
    positions: {
      sharp: "1 + 2",
      natural: "0",
      flat: "-",
    },
  },

  {
    name: "D",
    class: "full", // 'none || 'full', 'ledger',
    positions: {
      sharp: "2",
      natural: "1",
      flat: "1 + 2",
    },
  },

  {
    name: "E",
    class: "", // 'none || 'full', 'ledger',
    positions: {
      sharp: "1",
      natural: "0",
      flat: "2",
    },
  },

  {
    name: "F",
    class: "full", // 'none || 'full', 'ledger',
    positions: {
      sharp: "2",
      natural: "1",
      flat: "-",
    },
  },

  {
    name: "G",
    class: "", // 'none || 'full', 'ledger',
    positions: {
      sharp: "2 + 3",
      natural: "0",
      flat: "2",
    },
  },

  {
    name: "A",
    class: "ledger", // 'none || 'full', 'ledger',
    positions: {
      sharp: "1",
      natural: "1 + 2",
      flat: "2 + 3",
    },
  },

  {
    name: "B",
    class: "", // 'none || 'full', 'ledger',
    positions: {
      sharp: "0 (C)",
      natural: "2",
      flat: "1",
    },
  },

  {
    name: "C",
    class: "ledger", // 'none || 'full', 'ledger',
    positions: {
      sharp: "2",
      natural: "0",
      flat: "-",
    },
  },

  {
    name: "D",
    class: "", // 'none || 'full', 'ledger',
    positions: {
      sharp: "2 or 2 + 3",
      natural: "0 or 1",
      flat: "2 or 1 + 2",
    },
  },
];

let consoleNode, consoleNodeDesc, buttons;

const clickHandler = (e) => {
  const note = JSON.parse(e.target.dataset.note);

  consoleNode.innerHTML = `${note.name} &nbsp; ${note.positions.natural}`;

  desc = "";

  if (note.positions.sharp !== "" && note.positions.sharp !== "-") {
    desc += ` &#9839; ${note.positions.sharp} &nbsp; `;
  }
  if (desc != "" && note.positions.flat != "" && note.positions.flat != "-") {
    desc += "<span>•</span>";
  }
  if (note.positions.flat != "" && note.positions.flat != "-") {
    desc += ` &nbsp; &#9837; ${note.positions.flat}  `;
  }

  consoleNodeDesc.innerHTML = desc;

  Array.from(buttons).map((item) => {
    item.setAttribute("data-focused", false);
  });
  e.target.setAttribute("data-focused", true);
};

const shareHandler = (e) => {
  if (navigator.share) {
    navigator
      .share({
        title: "Musical Notes for B♭ instruments",
        text: "Check out Musical Notes for B♭ instruments.",
        url: "https://davidsimpson.me/labs/musical-notes/",
      })
      .then(() => console.log("Successful share"))
      .catch((error) => console.log("Error sharing", error));
  } else {
    console.log("webshare not supported by browser");
  }
};

window.onload = () => {
  const staff = document.getElementById("staff");
  let buttonHeight = 0;
  notes.map((item) => {
    // const text = document.createTextNode(item.name);

    const note = document.createElement("button");
    note.setAttribute("type", "button");
    note.setAttribute("class", item.class);
    note.setAttribute("data-note", JSON.stringify(item));
    note.onclick = clickHandler;
    // note.appendChild(text);
    note.innerHTML = '<div class="line"></div>' + item.name;
    staff.appendChild(note);
    console.log("buttonHeight", buttonHeight); //
    buttonHeight = note.clientHeight; // using the last one, because that is the correct height after appending *all* buttons/notes
  });

  const noteHeight = 1 * buttonHeight;
  const noteWidth = 1.6 * noteHeight;

  document.documentElement.style.setProperty(
    "--note-height",
    noteHeight + "px"
  );
  document.documentElement.style.setProperty("--note-width", noteWidth + "px");

  buttons = document.getElementsByTagName("button");
  lines = document.getElementsByClassName("line");
  consoleNode = document.getElementById("console-text");
  consoleNodeDesc = document.getElementById("console-text-desc");

  const shareButton = document.getElementById("webshare");
  shareButton.onclick = shareHandler;

  if (!navigator.share) {
    shareButton.hidden = true;
  }
};
