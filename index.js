const axios = require('axios');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.options('*', cors());

const sampleUserAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36';

const port = process.env.PORT || 5000;

async function getSlotsInfo({ districtID, date, minAge }) {
    minAge = minAge === '18' ? 18 : 45;
    try {
        const url = `http://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtID}&date=${date}`;
        console.log('DEBUG URL', { url });
        const result = await axios.get(url, {
            headers: { 'User-Agent': sampleUserAgent },
        });
        return (result.data.centers || [])
            .map(center => {
                return (center.sessions || [])
                    .map(session => {
                        return session.min_age_limit <= minAge &&
                            session.available_capacity > 0
                            ? session
                            : null;
                    })
                    .filter(x => x);
            })
            .filter(x => x && x.length);
    } catch (error) {
        throw error;
    }
}

app.get('/api', async (req, res) => {
    try {
        const slots = await getSlotsInfo(req.query);
        if (!slots.length) {
            return res.status(404).send('No Slots Available !!!');
        }
        return res.json(slots);
    } catch (err) {
        console.error('ERROR', err.message);
        return res.status(500).send('Something went wrong !!!');
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
