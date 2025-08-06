
const container = document.getElementById("section-container");
const modal = document.getElementById("modal");
const modalForm = document.getElementById("modal-form");
const modalTitle = document.getElementById("modal-title");
const themeToggle = document.getElementById("theme-toggle");
const addSectionBtn = document.getElementById("add-section");
const cancelBtn = document.getElementById("cancel");
const totalDisplay = document.getElementById("total");

let data = JSON.parse(localStorage.getItem("budgetData")) || [];

let modalMode = null;
let modalContext = null;

const save = () => {
  localStorage.setItem("budgetData", JSON.stringify(data));
};

const parsePrice = (min, max) => {
  const minVal = parseFloat(min);
  const maxVal = max ? parseFloat(max) : minVal;
  return [isNaN(minVal) ? 0 : minVal, isNaN(maxVal) ? minVal : maxVal];
};

const calcTotals = (items) => {
  return items.reduce(([min, max], item) => {
    const [itemMin, itemMax] = parsePrice(item.min, item.max);
    return [min + itemMin, max + itemMax];
  }, [0, 0]);
};

const updateDisplay = () => {
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = "<p class='no-data'>No data yet. Tap “+ Section” to begin.</p>";
    totalDisplay.textContent = "$0.00";
    return;
  }

  let totalMin = 0;
  let totalMax = 0;

  data.forEach((section, i) => {
    const sectionDiv = document.createElement("div");
    sectionDiv.className = "section";

    const sectionHeader = document.createElement("h2");
    sectionHeader.textContent = section.name;
    sectionDiv.appendChild(sectionHeader);

    let sectionMin = 0;
    let sectionMax = 0;

    section.subsections.forEach((sub, j) => {
      const subDiv = document.createElement("div");
      subDiv.className = "subsection";

      const subHeader = document.createElement("h3");
      subHeader.textContent = sub.name;
      subDiv.appendChild(subHeader);

      const itemList = document.createElement("ul");

      const [minSub, maxSub] = calcTotals(sub.items);
      sectionMin += minSub;
      sectionMax += maxSub;

      sub.items.forEach((item) => {
        const itemLi = document.createElement("li");
        const [min, max] = parsePrice(item.min, item.max);
        itemLi.innerHTML = \`\${item.name} — $\${min.toFixed(2)}\${max !== min ? ' - $' + max.toFixed(2) : ''}\`;
        itemList.appendChild(itemLi);
      });

      subDiv.appendChild(itemList);
      sectionDiv.appendChild(subDiv);
    });

    const sectionTotal = document.createElement("p");
    sectionTotal.className = "section-total";
    sectionTotal.textContent = \`Total: $\${sectionMin.toFixed(2)} - $\${sectionMax.toFixed(2)}\`;
    sectionDiv.appendChild(sectionTotal);

    totalMin += sectionMin;
    totalMax += sectionMax;

    container.appendChild(sectionDiv);
  });

  totalDisplay.textContent = \`$\${totalMin.toFixed(2)} - $\${totalMax.toFixed(2)}\`;
};

addSectionBtn.addEventListener("click", () => {
  modalMode = "section";
  modalTitle.textContent = "Add Section";
  modal.classList.remove("hidden");
});

modalForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("modal-name").value;
  if (modalMode === "section") {
    data.push({ name, subsections: [] });
  }
  save();
  modal.classList.add("hidden");
  modalForm.reset();
  updateDisplay();
});

cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

updateDisplay();
