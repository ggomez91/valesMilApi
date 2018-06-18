const unirest = require('unirest');

function fixedEncodeURIComponent(str) {
    return encodeURIComponent(str)
    .replace(/[!'()]/g, escape)
    .replace(/\*/g, '%2A');
}

function parse (response) {
    const regex = /\$([\d,\.]+)/;
    return regex.exec(response)[0];
}

function fetchData (context, card, password) {
    // Disable TLS velidations
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0    
    const req = unirest("POST", "https://www.efectivale.com.mx/consultaSaldos/miSaldo");
    
    req.headers({
        "Content-Type": "application/x-www-form-urlencoded",
    });
    
    let data = `tarjetaid=${card}&usuarioid=${fixedEncodeURIComponent(password)}&consulta=&oid=s`;    
    req.send(data);
    
    req.end(function (res) {
        if (res.error) throw new Error(res.error);
        let response = parse(res.body);
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: response,
        };
        context.done()
    });
}

module.exports = function (context, req) {
    context.log(':) JavaScript HTTP trigger function processed a request.');
    
    if ( req.body && (req.body.card && req.body.password )) {
        fetchData(context, req.body.card, req.body.password);
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a card and password on the request body"
        };
        context.done();
    }
};