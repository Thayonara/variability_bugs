const DATA_PATH = "data/";

async function listProjectFiles() {
    const response = await fetch(DATA_PATH);
    const text = await response.text();

    const files = [...text.matchAll(/href="([^"]+\.csv)"/g)].map(m => m[1]);
    return files;
}

async function loadCSV(file) {
    const response = await fetch(DATA_PATH + file);
    const text = await response.text();
    const rows = text.trim().split("\n");
    const headers = rows[0].split(",");
    const data = rows.slice(1).map(r => {
        const values = r.split(",");
        return headers.reduce((obj, h, idx) => {
            obj[h] = values[idx];
            return obj;
        }, {});
    });
    return { headers, data };
}

function renderTable(headers, data) {
    if ($.fn.dataTable.isDataTable("#bugsTable"))
        $("#bugsTable").DataTable().destroy();

    $("#bugsTable").empty();

    $("#bugsTable").DataTable({
        data: data,
        columns: headers.map(h => ({ title: h, data: h })),
        pageLength: 20
    });
}

function plotCounts(data, field, divId, title) {
    const counts = data.reduce((acc, row) => {
        acc[row[field]] = (acc[row[field]] ?? 0) + 1;
        return acc;
    }, {});

    Plotly.newPlot(divId, [{
        x: Object.keys(counts),
        y: Object.values(counts),
        type: "bar"
    }], { title });
}

async function loadProject(file) {
    const { headers, data } = await loadCSV(file);
    renderTable(headers, data);
    plotCounts(data, "feature_scope", "chart_feature_scope", "Feature Scope");
    plotCounts(data, "impact_scope", "chart_impact_scope", "Impact Scope");
}

async function init() {
    const files = await listProjectFiles();

    const selector = document.getElementById("projectSelector");
    files.forEach(f => {
        const opt = document.createElement("option");
        opt.value = f;
        opt.textContent = f.replace(".csv", "");
        selector.appendChild(opt);
    });

    selector.addEventListener("change", e => loadProject(e.target.value));

    // load first project by default
    if (files.length > 0) loadProject(files[0]);
}

init();

