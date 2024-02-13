const express = require('express');
const axios = require('axios');
const app = express();

const getPresence = async (xuid) => {
    const response = await axios.get(`https://userpresence.xboxlive.com/users/xuid(${xuid})`, {
        headers: {
            'x-xbl-contract-version': '1'
        }
    });

    return response.data;
};
app.get('/presence/:xuid', async (req, res) => {
    try {
        const xuid = req.params.xuid;
        const presence = await getPresence(xuid);

        if (presence.state === 'Online') {
            const devices = presence.devices.map(device => ({
                type: device.type,
                titles: device.titles.map(title => ({
                    id: title.id,
                    name: title.name,
                    state: title.state,
                    placement: title.placement,
                    timestamp: title.lastModified,
                    activity: {
                        richPresence: title.activity.richPresence
                    }
                }))
            }));

            res.json({
                xuid,
                state: presence.state,
                devices
            });
        } else {
            res.json({
                xuid,
                state: 'Offline'
            });
        }
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));