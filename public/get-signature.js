let wholeDocument = $("body")
let signatureField = $("#signatureField")
let paintmode = false
let ctx = signatureField[0].getContext("2d")

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
            let dataURL = signatureField[0].toDataURL()
            $("#hiddenSignatureField").val(dataURL)
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