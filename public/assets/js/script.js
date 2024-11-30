document.addEventListener("DOMContentLoaded", async () => {
    let model;

    // Cargar el modelo TensorFlow.js
    try {
        model = await tf.loadGraphModel('./assets/tensorflowjs/model.json');
        console.log(model)
        console.log("Modelo cargado con éxito.");
    } catch (error) {
        console.error("Error al cargar el modelo:", error);
    }

    // Calcular edad con los datos ingresados
    document.getElementById("calculateButton").addEventListener("click", () => {
        const books = parseFloat(document.getElementById("books").value);
        const clothing = parseFloat(document.getElementById("clothing").value);
        const electronics = parseFloat(document.getElementById("electronics").value);
        const home = parseFloat(document.getElementById("home").value);
        if (!model || isNaN(books) || isNaN(clothing) || isNaN(electronics) || isNaN(home)) {
            alert("Por favor, completa todos los campos correctamente y asegúrate de que el modelo esté cargado.");
            return;
        }

        const total = books + clothing + electronics + home;
        const inputTensor = tf.tensor([[books, clothing, electronics, home, total]]);
        const prediction = model.predict(inputTensor);
        const predictedAge = prediction.dataSync()[0].toFixed(2);

        document.getElementById("predictedAge").textContent = predictedAge;
        document.getElementById("result").classList.remove("d-none");
    });

    // Procesar archivo subido
    document.getElementById("processFileButton").addEventListener("click", async () => {
        const fileInput = document.getElementById("fileInput").files[0];

        if (!fileInput) {
            alert("Por favor, selecciona un archivo para procesar.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet);

            const results = json.map((row) => {
                const total = row.Books + row.Clothing + row.Electronics + row.Home;
                const inputTensor = tf.tensor([[row.Books, row.Clothing, row.Electronics, row.Home, total]]);
                const prediction = model.predict(inputTensor);
                return { ...row, PredictedAge: prediction.dataSync()[0].toFixed(2) };
            });

            const newSheet = XLSX.utils.json_to_sheet(results);
            const newWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Resultados");

            const output = XLSX.write(newWorkbook, { bookType: "xlsx", type: "binary" });
            const blob = new Blob([s2ab(output)], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);

            const downloadLink = document.getElementById("downloadFile");
            downloadLink.href = url;
            downloadLink.download = "predicciones.xlsx";
            document.getElementById("downloadLink").classList.remove("d-none");
        };

        reader.readAsBinaryString(fileInput);
    });

    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
    }
});
