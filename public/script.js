//alert("Yo")
let i = 1;
const tabs = document.querySelectorAll('[data-tab-target]');
const tabContents = document.querySelectorAll('[data-tab-content]');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = document.querySelector(tab.dataset.tabTarget);
        tabContents.forEach(tabContent => {
            tabContent.classList.remove('active');
        });
        tabs.forEach(tab => {
            tab.classList.remove('active');
            tab.classList.add('unactive');
        });
        tab.classList.remove('unactive');
        tab.classList.add('active');
        target.classList.add('active');

        if (tab.id == "sidebar-button-guide") {
            alert(i);
            // guideWindow(1);
            const currGuide = document.getElementById('guide-' + i);
            currGuide.classList.remove('unactive');
            currGuide.classList.add('active');
        }
    });
});

// guidePart
const nextBtn = document.getElementById('guide-next-button');
const backBtn = document.getElementById('guide-back-button');
const currGuide = document.getElementById('guide-' + i);

nextBtn.addEventListener('click', () => {
    if (i < 8) {
        currGuide.classList.remove('active');
        currGuide.classList.add('unactive');
        i = i + 1;
        const nextGuide = document.getElementById('guide-' + i);
        nextGuide.classList.remove('unactive');
        nextGuide.classList.add('active');
    }
});

backBtn.addEventListener('click', () => {
    if (i > 1) {
        currGuide.classList.remove('active');
        currGuide.classList.add('unactive');
        i = i - 1;
        const nextGuide = document.getElementById('guide-' + i);
        nextGuide.classList.remove('unactive');
        nextGuide.classList.add('active');
    }
});


