function main() {
    fetch("../readme.md")
    .then((response) => response.text())
    .then((html) => {
        document.getElementById("readme").innerHTML = html;
    });

    fetch("../privacy.md")
    .then((response) => response.text())
    .then((html) => {
        document.getElementById("privacy").innerHTML = "<h2>privacy policy and cookies:</h2><p>"+escapeHTML(html)+"</p>";
    });

    fetch("../../LICENSE")
    .then((response) => response.text())
    .then((html) => {
        document.getElementById("license").innerHTML = "<h2>license</h2><p>"+escapeHTML(html)+"</p>";
    });
}

function escapeHTML(str){
    var p = document.createElement("p");
    p.appendChild(document.createTextNode(str));
    return p.innerHTML.replaceAll("\n", "<br>");
}