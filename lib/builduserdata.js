var response = require('cfn-response')

function postResponse(Event, Context, Status, Data) {
    return new Promise(() => {
        setTimeout(() => response.send(Event, Context, Status, Data), 5000)
    })
}

exports.handler = async (ev, ctx) => {
    if (ev.ResourceProperties.VERSION && ev.ResourceProperties.VERSION !== 'none') {
        await postResponse(ev, ctx, response.SUCCESS, {userData: ev.ResourceProperties.SCRIPT})
    } else {
        await postResponse(ev, ctx, response.SUCCESS, {userData: ''})
    }    
}
