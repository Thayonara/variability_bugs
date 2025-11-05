async function loadData() {
    const response = await fetch("data/variability_bugs_dataset.csv");
    const text = await response.text();

    const rows = text.split("\n").slice(1);
    const cols = rows.map(r => r.split(","));

    const headers = [
        "project_name", "repository_url", "commit_hash", "author", "date",
        "message", "bug_probability", "matched_features", "files_changed",
        "impact_scope", "feature_scope"
    ];

    const data = rows.map(line => {
        const values = line.split(",");
        return headers.reduce((obj, h, idx) => {
            obj[h] = values[idx];
            return obj;
        }, {});
    });

    // Create Table
    $('#bugsTable').DataTable({
        data: data,
        columns: headers.map(h => ({ title: h, data: h })),
        pageLength: 25,
        searchHighlight: true
    });

    // Charts
    function countBy(key) {
        return data.reduce((a, r) => {
            a[r[key]] = (a[r[key]] || 0) + 1;
            return a;
        }, {});
    }

    function plot(key, elem, title) {
        const counts = countBy(key);
        Plotly.newPlot(elem, [{
            x: Object.keys(counts),
            y: Object.values(counts),
            type: 'bar'
        }], { title });
    }

    plot("project_name", "chart_project", "Bugs by Project");
    plot("feature_scope", "chart_feature_scope", "Feature Scope Distribution");
    plot("impact_scope", "chart_impact_scope", "Impact Scope Distribution");
}

loadData();
