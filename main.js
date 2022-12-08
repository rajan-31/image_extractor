$(document).ready(function () {

    // handle extract btn click
    $('#extract_btn').click(function () {
        const url = $('#url').val();

        axios.get(url)
            .then(function (response) {
                // handle success
                console.log(`Response Status: ${response.status}`);
                $(`<div id="extracted_html">${response.data}</div>`, {}).appendTo("body");

                // get image urls
                let e_all = $('#extracted_html').find('img').map(function () { return this.src; }).get();

                // get pure urls
                let e_pure = [];
                e_all.forEach(element => {
                    e_pure.push(element.split("?")[0]);
                });
                console.log(e_pure);
                // e_pure = e_pure.slice(10, 15)

                // download and zip images
                console.log('------download and zip images------')
                var zip = new JSZip();

                // let temp_url = e_pure[0];
                e_pure.forEach(element => {
                    console.log(element);

                    const imageBlob = fetch(element).then(response => response.blob());
                    let temp_name = element.split('/');
                    temp_name = temp_name[temp_name.length - 1];
                    zip.file(temp_name, imageBlob);
                });

                zip.generateAsync({ type: "blob" })
                    .then(function (zipBlob) {
                        const currentDate = new Date().getTime();
                        const fileName = `combined-${currentDate}.zip`;

                        saveAs(zipBlob, fileName);
                    });


            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .then(function () {
                // always executed
            });
    });
});