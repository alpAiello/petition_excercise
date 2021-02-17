let wholeDocument = $("body")
let signatureField = $("#signature-field")
let signatureFieldCanvas = document.getElementById("signature-field")
let paintmode = false
let ctx = signatureFieldCanvas.getContext("2d")

signatureField
    .on("mousedown", (e) => {
        paintmode = true
        console.log("starting to paint");
        ctx.beginPath()
        ctx.moveTo(e.pageX - signatureField.offset().left, e.pageY - signatureField.offset().top)
    })
signatureField
    .on("mousemove", (e) => {
        if (paintmode == true) {
            ctx.lineTo(e.pageX - signatureField.offset().left, e.pageY - signatureField.offset().top)
            ctx.stroke()
        }
    })
signatureField
    .on("mouseleave", (e) => {
        ctx.beginPath()
    })
signatureField
    .on("mouseenter", (e) => {
        ctx.moveTo(e.pageX - signatureField.offset().left, e.pageY - signatureField.offset().top)
    })
wholeDocument
    .on("mouseup", (e) => {
        if (paintmode == true) {
            paintmode = false
            ctx.stroke()
            console.log("ending to paint")
        }
    })