const dataPath = "projects_split/";

async function listCSVFiles() {
    const response = await fetch(dataPath);
    const text = await response.text();
    
    const links = [...text.matchAll(/href="([^"]+\.csv)"/g)].map(m => m[1]);
    return links;
}

async function loadCSV(file) {
    const response = await fetch(dataPath + file);
    const text = await response.text();
    
    const rows = text.split("\n").slice(1);
    const headers = text.split("\n")[0].split(",");

    const data = rows.filter(r => r.trim() !== "").map(line => {
        const values = line.split(",");
        return headers.reduce((obj, h, idx) => {
            obj[h] = values[idx];
            return obj;
        }, {});
    });

    $('#bugsTable').DataTable().clear().destroy();
    $('#bugsTable').DataTable({
        data,
        columns: headers.map(h => ({ title: h, data: h })),
        pageLength: 20,
        searchHighlight: true
    });

    return data;
}

async function init() {
    const files = await listCSVFiles();
    const selector = document.createElement("select");
    selector.id = "projectSelect";

    files.forEach(f => {
        let opt = document.createElement("option");
        opt.value = f;
        opt.textContent = f.replace(".csv","");
        selector.appendChild(opt);
    });

    document.body.prepend(selector);
    
    selector.addEventListener("change", async () => {
        const data = await loadCSV(selector.value);
        plotData(data);
    });

    const first = files[0];
    const data = await loadCSV(first);
    plotData(data);
}

function plotData(data) {
    function countBy(key) {
        return data.reduce((a, r) => {
            a[r[key]] = (a[r[key]] || 0) + 1;
            return a;
        }, {});
    }

    function plot(key, elemId, title) {
        const counts = countBy(key);
        Plotly.newPlot(elemId, [{
            x: Object.keys(counts),
            y: Object.values(counts),
            type: 'bar'
        }], { title });
    }

    plot("feature_scope", "chart_feature_scope", "Feature Scope");
    plot("impact_scope", "chart_impact_scope", "Impact Scope");
}

init();
