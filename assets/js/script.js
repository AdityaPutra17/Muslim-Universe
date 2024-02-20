setInterval(() => {
    d = new Date(); //object of date()
    hr = d.getHours();
    min = d.getMinutes();
    sec = d.getSeconds();
    hr_rotation = 30 * hr + min / 2; //converting current time
    min_rotation = 6 * min;
    sec_rotation = 6 * sec;

    hour.style.transform = `rotate(${hr_rotation}deg)`;
    minute.style.transform = `rotate(${min_rotation}deg)`;
    second.style.transform = `rotate(${sec_rotation}deg)`;
}, 1000);

const apiUrl = 'https://api.aladhan.com/v1/calendarByCity/2024/1?city=Jakarta&country=Indonesia&method=2';


function updateCountdown(targetTime) {
    const now = new Date().getTime();
    const distance = targetTime - now;

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const jamElement = document.getElementById('jam');
    const menitElement = document.getElementById('menit');
    const detikElement = document.getElementById('detik');

    jamElement.innerText = hours.toString().padStart(2, '0');
    menitElement.innerText = minutes.toString().padStart(2, '0');
    detikElement.innerText = seconds.toString().padStart(2, '0');
}

function addMinutes(time, minutes) {
    const [hours, originalMinutes] = time.split(":").map(Number);
    const newMinutes = (originalMinutes + minutes) % 60;
    const newHours = hours + Math.floor((originalMinutes + minutes) / 60);
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}

function fetchPrayerTimes() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Data dari API:', data);

            const currentDate = new Date();
            const today = currentDate.getDate();

            // Set tanggal Gregorian saat ini
            const todayElement = document.getElementById('today');
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            todayElement.innerText = currentDate.toLocaleDateString('en-US', options);

            for (i = 0; i < data.data.length; i++) {

                // Set tanggal Hijriah saat ini
                const hijriDateElement = document.getElementById('todayHijriah');
                hijriDateElement.innerText = `${data.data[i].date.hijri.day - 18} ${data.data[i].date.hijri.month.en} ${data.data[i].date.hijri.year}`;
            }

            if (data && data.data && data.data.length > 0) {
                const prayerTimes = data.data[0].timings;

                console.log('Jadwal solat untuk hari ini:', prayerTimes);

                // Cari waktu salat berikutnya
                const nextPrayerTimeEntry = Object.entries(prayerTimes).find(([key, time]) => {
                    const prayerTime = new Date(`2024-01-${today}T${time.split(" ")[0]}+07:00`);
                    return prayerTime > currentDate;
                });

                // Ganti text di id salat
                const salatElement = document.getElementById('salat');
                salatElement.innerText = `"${nextPrayerTimeEntry[0]}"`;

                if (nextPrayerTimeEntry) {
                    console.log('Waktu solat berikutnya:', nextPrayerTimeEntry);

                    // Konversi waktu jadi lokal UCT +07:00
                    const targetTime = new Date(`2024-01-${today}T${nextPrayerTimeEntry[1].split(" ")[0]}+07:00`).getTime();

                    // update countdown tiap detik
                    setInterval(() => {
                        updateCountdown(targetTime);
                    }, 1000);

                    // // add warna kuning di table
                    const prayerTable = document.getElementById('prayerTable');
                    const rows = prayerTable.getElementsByTagName('tr');

                    for (let i = 0; i < rows.length; i++) {
                        const prayerName = rows[i].cells[0].innerText.toLowerCase();
                        if (prayerName === nextPrayerTimeEntry[0].toLowerCase()) {
                            rows[i].classList.add('bg-yellow', 'bg-opacity-40');
                        } else {
                            rows[i].classList.remove('bg-yellow', 'bg-opacity-40');
                        }
                    }
                } else {
                    console.error('Tidak dapat menemukan waktu solat berikutnya.');
                }

            } else {
                console.error('Data tidak valid dari API.');
            }
            const adzan = data.data[0].timings
            document.querySelector('.subuh').textContent = adzan.Fajr
            document.querySelector('.dzuhur').textContent = adzan.Dhuhr
            document.querySelector('.ashar').textContent = adzan.Asr
            document.querySelector('.magrib').textContent = adzan.Maghrib
            document.querySelector('.isya').textContent = adzan.Isha
        })
        .catch(error => console.error('Error fetching data:', error));
}

document.addEventListener('DOMContentLoaded', fetchPrayerTimes);
