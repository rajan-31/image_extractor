$(document).ready(function () {
    let total_files = 0;
    let total_size = 0;

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
            $('#user_log').html('');
            $('#total_files').html('0'); total_files = 0;
            $('#total_size').html('0'); total_size = 0;

            const proxy_url = $('#proxy').val().trim();
            const proxy_for = $("#proxy_for").val();
            const sanitize_scripts = $("#sanitize_scripts").is(":checked");

            let url = proxy_url == "" || proxy_for == 1 ? $('#url').val().trim() : proxy_url + $('#url').val().trim();

            console.log("Main URL: " + url);

            //---------------------------------------------------------
            let direct_links = $('#direct_img_links').val();
            //---------------------------------------------------------

            if (url != "" || direct_links != "") {
                $('#user_msg').html('wait...');

                // direct links
                if(direct_links) url = '/';

                axios.get(url)
                    .then(async function (response) {
                        // not direct links
                        let e_pure = [];
                        if(url != "/") {
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
                            // get pure urls, remove params after ?
    
                            // use proxy url if set in select
                            let e_proxy_temp = proxy_for == 1 || proxy_for == 2 ? proxy_url : "";
                            e_all.forEach(element => {
                                let temp1 = element.split("?")[0];
                                if (verify_img_extension(temp1))
                                    e_pure.push(e_proxy_temp + temp1);
                            });
                        } else {
                            // seperate direct links
                            let e_proxy_temp = proxy_for == 1 || proxy_for == 2 ? proxy_url : "";
                            direct_links.split('\n').forEach(element => {
                                e_pure.push(e_proxy_temp + element);
                            });
                        }
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
                        total_files = 0;
                        total_size = 0;
                        for (let i=0; i<e_pure.length; i++) {
                            let element = e_pure[i];
                            console.log(element);

                            let imageBlob_size = 0;
                            await fetch(element)
                            .then(response => response.blob())
                            .then(blobb => {
                                imageBlob_size = blobb.size;
                                let temp_name = element.split('/');
                                temp_name = temp_name[temp_name.length - 1];

                                if($('#min_size').val() == '' || imageBlob_size/1000 > $('#min_size').val()) {
                                    try {
                                        zip.file(temp_name, blobb);

                                        total_files +=1;
                                        total_size += imageBlob_size/1000;
                                        $('#total_files').html(total_files);
                                        $('#total_size').html(total_size);

                                        if($('#show_logs').is(':checked'))
                                            $('#user_log').prepend(`<p>ADDED [${imageBlob_size/1000} kB]: <a href="${element.replace(proxy_url, '')}">${element.replace(proxy_url, '')}</a></p>`);
                                    } catch (error) {
                                        console.log('ERROR ADDING FILE TO ZIP ====> ' + error)
                                        $('#user_msg').html(error.message);
                                    }
                                }
                            })
                            .catch((error) => {
                                console.log("IMAGE FETCH ERROR for: " + element + "====> " + error)
                                $('#user_msg').html(error.message);
                            });
                        };

                        await zip.generateAsync({ type: "blob" })
                            .then(function (zipBlob) {
                                const currentDate = new Date().getTime();
                                // const fileName = `combined-${currentDate}.zip`;
                                let fileName = `combined-${currentDate}.zip`
                                if(url != '/') 
                                    fileName = `${$('#extracted_html title').text().replace(" ", "_")}-${currentDate}.zip`;

                                saveAs(zipBlob, fileName);
                                if($('#clear_logs_auto').is(':checked')) $('#user_log').html("");
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
                $('#user_msg').html('No url or Direct image links entered!');
            }
        });
    } catch (errorx) {
        console.log("ERROR IN ROOT ===> " + errorx);
        $('#user_msg').html(errorx.message);
    }

    $("#clear_logs").click(()=> {
        $('#user_log').html('');
        $('#total_files').html('0'); total_files = 0;
        $('#total_size').html('0'); total_size = 0;
    });
});