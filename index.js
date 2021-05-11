const axios = require('axios');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.options('*', cors());

const sampleUserAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36';

const port = process.env.PORT || 5000;

async function getSlotsInfo() {
    try {
        const result = await axios.get(
            `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=1&date=11-05-2021`,
            { headers: { 'User-Agent': sampleUserAgent } }
        );
        return (result.data.centers || []).map(center => {
            return (center.sessions || []).map(session => {
                if (
                    session.min_age_limit <= 45 &&
                    session.available_capacity > 0
                ) {
                    return session;
                }
            });
        });
    } catch (error) {
        throw error;
    }
}

app.get('/', async (req, res) => {
    try {
        const slots = await getSlotsInfo();
        if (!slots.length) {
            return res.status(404).send('No Slots Available !!!');
        }
        return res.json(slots);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Something went wrong !!!');
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
