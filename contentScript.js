function domain(address) {
    const domain = address.match(/[a-zA-z0-9\.-]+@([a-zA-z0-9\.-]+)/)
    return (domain == null) ? "" : domain[1];
}

function capitalize(str) {
    const lower = str.toLowerCase();
    return str.charAt(0).toUpperCase() + lower.slice(1);
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function listSubject(emailForm) {
    let subject = htmlEntities(emailForm.parentNode.querySelectorAll('input[name=subject]')[0].value);
    // Not refreshing.... on first click
    console.log(subject);
    return `
        <font color="${subject ? '#00f' : '#f00'}">
            ${subject ? subject : 'No subject'}
        </font>
    `
}

function listEmailAddesses(emailForm) {
    let sender, output = '';
    for(const field of ['from', 'to', 'cc', 'bcc']) {
        let addresses = [];
        for(const address of emailForm.parentNode.querySelectorAll(`input[name=${field}]`)) {
            if(field === 'from') {
                sender = address.value;
                addresses.push(sender);
                continue;
            }
            const safeDomain = domain(sender) == domain(address.value);
            addresses.push(`
                <font color="${safeDomain ? '#00f' : '#f00'}">
                    ${htmlEntities(address.value)}
                </font>
            `);
        }
        if(addresses.length) {
            output += `<strong>${capitalize(field)}:</strong> ${addresses.join(', ')} <br>`;
        }
    }
    return output
}


function setConfirmBeforeSendButtons () {
    for(const [index, form] of document.querySelectorAll('td form[method=POST]').entries()) {
/******console.log('Check if we have already setup confirm button.')/*********/
        if(! form.parentNode.querySelector('div[pgmcbs-confirm]')) {
/**********console.log('If not let find the send button.')/*******************/
            const sendButton = form.parentNode.querySelector('div[aria-label*="Enter)"]');
            if(sendButton) {
/**************console.log('Create Confirm button')/**************************/
                let confirmButton = sendButton.cloneNode();
                confirmButton.removeAttribute('id');
                confirmButton.setAttribute('pgmcbs-confirm', index);
                confirmButton.setAttribute("aria-label", 'Confirm');
                confirmButton.setAttribute("data-tooltip", 'Confirm');
                confirmButton.innerText = 'Confirm';
                Object.assign(confirmButton.style, {
                    backgroundColor:    '#096910',
                    borderRadius:       '4px',
                    minWidth:           '80px'
                });
                confirmButton.onclick = (event) => {
                    Swal.fire({
                      title: 'Are you sure?',
                      text: "You are about to send the following email!",
                      icon: 'warning',
                      html: `
                        You are about to send the following email! <br>
                        <br>
                        <strong>Subject:</strong> ${listSubject(form)} <br>
                        <br>
                        ${listEmailAddesses(form)}
                      `,
                      showCancelButton: true,
                      confirmButtonColor: '#3085d6',
                      cancelButtonColor: '#d33',
                      confirmButtonText: 'Yes, unlock sending!'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        sendButton.parentNode.style.display = "";
                        sendButton.parentNode.nextElementSibling.style.display = "";
                        confirmButton.parentNode.removeChild(confirmButton);
                        Swal.fire({
                            title: 'Sending Unlocked!',
                            text: 'Your email is ready to be send.',
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 1500
                        });
                      }
                    });
                };
                sendButton.parentNode.parentNode.append(confirmButton);
/**************console.log('Hide Send button')/*******************************/
                sendButton.parentNode.style.display = "none";
                sendButton.parentNode.nextElementSibling.style.display = "none";
            }
        }
    }
}

// Make all buttons confirm
document.addEventListener('focus', (event) => {
    const target = event.target;
    if (target.name == 'to'
    || target.name == 'cc'
    || target.name == 'bcc'
    || target.name == 'subjectbox'
    || target.name == 'subject'
    || target.getAttribute('role') == "textbox") {
        setConfirmBeforeSendButtons();
    }
}, true);

// Diasble Ctrl+Enter
document.addEventListener('keydown', (event) => {
    if (event.key == 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.stopPropagation();
    }
}, true);