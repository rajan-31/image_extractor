$(document).ready(function () {

    try {
        function verify_img_extension(str) {
            if (str.endsWith('.jpg')) return true
            else if (str.endsWith('.jpeg')) return true
            else if (str.endsWith('.png')) return true
            else if (str.endsWith('.svg')) return true
            else if (str.endsWith('.webp')) return true
            else return false
        }

        // handle extract btn click
        $('#extract_btn').click(function () {
            const proxy_url = $('#proxy').val().trim();
            const proxy_for = $("#proxy_for").val();
            const sanitize_scripts = $("#sanitize_scripts").is(":checked");

            const url = proxy_url == "" || proxy_for == 1 ? $('#url').val().trim() : proxy_url + $('#url').val().trim();

            console.log("Main URL: " + url);


            if (url != "") {
                $('#user_msg').html('wait...');

                axios.get(url)
                    .then(async function (response) {
                        // handle success
                        console.log(`Response Status: ${response.status}`);

                        //------------------------------------------------
                        let temp_html = $.parseHTML(response.data);

                        console.log(temp_html);
                        let sanitized_html = temp_html.filter((elt) => {
                            if (sanitize_scripts == true && elt.tagName == 'SCRIPT') return false;
                            if ((elt.tagName == 'LINK' && elt.rel == 'stylesheet') || elt.tagName == 'STYLE') return false;
                            else return true;
                        })
                        console.log(sanitized_html);
                        //------------------------------------------------

                        $('#extracted_html').append(sanitized_html);

                        // get image urls
                        let e_img = $('#extracted_html').find('img').map(function () { return this.src; }).get();
                        let e_a = $('#extracted_html').find('a').map(function () { return this.href; }).get();

                        let e_all = [...e_img, ...e_a];

                        // get pure urls
                        let e_pure = [];

                        // use proxy url if set in select
                        let e_proxy_temp = proxy_for == 1 || proxy_for == 2 ? proxy_url : "";
                        e_all.forEach(element => {
                            let temp1 = element.split("?")[0];
                            if (verify_img_extension(temp1))
                                e_pure.push(e_proxy_temp + temp1);
                        });
                        console.log(e_pure);

                        //--------------------------------------------------------------------
                        // const delay = $('#delay').val();
                        // console.log(`Start delay for ${delay} seconds.`);
                        // $('#user_msg').html('Main URL fetched delaying image fetch...');

                        // await setTimeout(() => {
                        //     console.log(`Delayed for ${delay} seconds.`);
                        //     $('#user_msg').html('wait...');
                        // }, delay * 1000)

                        //--------------------------------------------------------------------
                        // download and zip images
                        console.log('------download and zip images------')
                        var zip = new JSZip();

                        // let temp_url = e_pure[0];
                        e_pure.forEach(element => {
                            console.log(element);

                            const imageBlob = fetch(element).then(response => response.blob()).catch((error) => {
                                console.log("IMAGE FETCH ERROR for: " + element + "====> " + error)
                                $('#user_msg').html(error.message);
                            });
                            ;
                            let temp_name = element.split('/');
                            temp_name = temp_name[temp_name.length - 1];

                            try {
                                zip.file(temp_name, imageBlob);
                            } catch (error) {
                                console.log('ERROR ADDING FILE TO ZIP ====> ' + error)
                                $('#user_msg').html(error.message);
                            }
                        });

                        zip.generateAsync({ type: "blob" })
                            .then(function (zipBlob) {
                                const currentDate = new Date().getTime();
                                // const fileName = `combined-${currentDate}.zip`;
                                const fileName = `${$('#extracted_html title').text().replace(" ", "_")}-${currentDate}.zip`;

                                saveAs(zipBlob, fileName);
                                $('#user_msg').html('DONE');

                            });


                    })
                    .catch(function (error) {
                        // handle error
                        console.log("MAIN FETCH ERROR ====> " + error);
                        $('#user_msg').html(error.message);
                    })
                    .then(function () {
                        // always executed
                    });
            } else {
                $('#user_msg').html('No url entered!');
            }
        });
    } catch (errorx) {
        console.log("ERROR IN ROOT ===> " + errorx);
        $('#user_msg').html(errorx.message);
    }
});