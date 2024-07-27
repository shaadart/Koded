let topicsData = []; // Variable to store fetched data globally

fetch('data.json')
  .then(response => response.json())
  .then(data => {
    topicsData = data.topics; // Store data globally
    displayContent(topicsData, 0); // Display first topic initially
    populateSidebar(topicsData); // Populate sidebar with topics
    adjustContentMargin(); // Adjust content margin initially
  })
  .catch(error => console.error('Error fetching JSON data:', error));

function populateSidebar(topics) {
    const sidebarMenu = document.getElementById('sidebar-menu');
    
    topics.forEach((topic, index) => {
        const sidebarItem = document.createElement('li');
        const sidebarLink = document.createElement('a');
        sidebarLink.href = `#topic-${index}`;
        sidebarLink.textContent = topic.title;
        sidebarLink.setAttribute('data-index', index); // Store index for navigation
        sidebarItem.appendChild(sidebarLink);
        sidebarMenu.appendChild(sidebarItem);
    });
}

function displayContent(topics, index) {
    const contentContainer = document.getElementById('content-container');
    contentContainer.innerHTML = ''; // Clear previous content

    const topic = topics[index];
    const topicElement = document.createElement('div');
    topicElement.classList.add('topic');

    const title = document.createElement('h2');
    title.textContent = topic.title;
    topicElement.appendChild(title);

    if (topic.url) {
        if (topic.title === "Practice") {
            const pdfContainer = document.createElement('div');
            pdfContainer.classList.add('pdf-container');

            const iframe = document.createElement('iframe');
            iframe.src = topic.url;
            iframe.style.width = '100%';
            iframe.style.height = '800px'; // Adjust height as needed
            iframe.frameBorder = 0;

            pdfContainer.appendChild(iframe);
            topicElement.appendChild(pdfContainer);
        } else {
            const videoContainer = document.createElement('div');
            videoContainer.classList.add('video-container');

            const iframe = document.createElement('iframe');
            const videoId = new URL(topic.url).searchParams.get('v');
            iframe.src = `https://www.youtube.com/embed/${videoId}`;
            iframe.frameBorder = 0;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;

            videoContainer.appendChild(iframe);
            topicElement.appendChild(videoContainer);
        }
    }

    topic.content.forEach(section => {
        const subsection = document.createElement('h3');
        subsection.textContent = section.subsection;
        topicElement.appendChild(subsection);

        if (section.description) {
            const description = document.createElement('p');
            description.textContent = section.description;
            topicElement.appendChild(description);
        }

        if (section.image) {
            const img = document.createElement('img');
            img.src = section.image;
            img.alt = section.subsection;
            img.style.width = '100%';
            img.style.height = 'auto';
            topicElement.appendChild(img);
        }

        if (section.video) {
            const videoContainer = document.createElement('div');
            videoContainer.classList.add('video-container');

            const video = document.createElement('video');
            video.src = section.video;
            video.controls = true;
            video.style.width = '100%';

            videoContainer.appendChild(video);
            topicElement.appendChild(videoContainer);
        }
        if (section.list) {
            const list = document.createElement('ul');
            section.list.forEach(item => {
                const listItem = document.createElement('li');
                listItem.innerHTML = item.replace(/`(\w+)`/, '<strong>$1</strong>'); // Bold the text inside backticks
                list.appendChild(listItem);
            });
            topicElement.appendChild(list);
        }

        if (section.features) {
            const list = document.createElement('ul');
            section.features.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = item;
                list.appendChild(listItem);
            });
            topicElement.appendChild(list);
        }


        if (section.code) {
            const codeBlock = document.createElement('div');
            codeBlock.classList.add('code-block');

            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = section.code.content.join('\n');

            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copy';
            copyButton.classList.add('copy-button');
            copyButton.addEventListener('click', () => {
                copyCodeToClipboard(section.code.content.join('\n'));
            });

            pre.appendChild(copyButton);
            pre.appendChild(code);
            codeBlock.appendChild(pre);

            topicElement.appendChild(codeBlock);
        }

        // Handle MCQ, if present
        if (section.mcq) {

            const mcqSection = document.createElement('div');

            mcqSection.classList.add('mcq-section');



            section.mcq.forEach((question, qIdx) => {

                const questionElement = document.createElement('div');

                questionElement.classList.add('mcq-question');

                questionElement.textContent = `${qIdx + 1}. ${question.question}`;

                mcqSection.appendChild(questionElement);



                const optionsList = document.createElement('ul');

                optionsList.classList.add('mcq-options');



                question.options.forEach(option => {

                    const optionItem = document.createElement('li');



                    const optionLabel = document.createElement('label');

                    const optionRadio = document.createElement('input');

                    optionRadio.type = 'radio';

                    optionRadio.name = `mcq-${index}-${qIdx}`;

                    optionRadio.value = option;



                    optionLabel.appendChild(optionRadio);

                    optionLabel.appendChild(document.createTextNode(option));

                    optionItem.appendChild(optionLabel);

                    optionsList.appendChild(optionItem);

                });



                mcqSection.appendChild(optionsList);

            });



            const checkAnswersButton = document.createElement('button');

            checkAnswersButton.textContent = 'Check Answers';

            checkAnswersButton.addEventListener('click', () => {

                checkMCQAnswers(section.mcq, index);

            });

            mcqSection.appendChild(checkAnswersButton);



            topicElement.appendChild(mcqSection);

        }

    });

    contentContainer.appendChild(topicElement);

    const sidebarItems = document.querySelectorAll('.sidebar nav ul li');
    sidebarItems.forEach((item, idx) => {
        item.classList.remove('active');
        if (idx === index) {
            item.classList.add('active');
        }
    });

    const navigationContainer = document.createElement('div');
    navigationContainer.classList.add('navigation');

    if (index > 0) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => {
            displayContent(topics, index - 1);
        });
        navigationContainer.appendChild(prevButton);
    }

    if (index < topics.length - 1) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
            displayContent(topics, index + 1);
        });
        navigationContainer.appendChild(nextButton);
    }

    contentContainer.appendChild(navigationContainer);
}


function checkMCQAnswers(mcqs, topicIndex) {
    // Clear out any existing results before adding new ones
    const existingResults = document.querySelectorAll('.mcq-result');
    existingResults.forEach(result => result.remove());

    mcqs.forEach((question, qIdx) => {
        const selectedOption = document.querySelector(`input[name="mcq-${topicIndex}-${qIdx}"]:checked`);
        const resultElement = document.createElement('div');
        resultElement.classList.add('mcq-result');

        if (selectedOption) {
            if (selectedOption.value === question.answer) {
                resultElement.classList.add('correct');
                resultElement.textContent = 'Correct!';
            } else {
                resultElement.classList.add('incorrect');
                resultElement.textContent = `Incorrect! The correct answer is: ${question.answer}`;
            }
        } else {
            resultElement.classList.add('warning');
            resultElement.textContent = `Please select an answer. The correct answer is: ${question.answer}`;
        }

        const questionElement = document.querySelector(`.mcq-section .mcq-question:nth-child(${qIdx * 2 + 1})`);
        questionElement.appendChild(resultElement);
    });
}


function adjustContentMargin() {
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');

    if (sidebar && content) {
        const sidebarWidth = sidebar.offsetWidth;
        content.style.marginLeft = `${sidebarWidth}px`;
    }
}

function copyCodeToClipboard(code) {
    const textarea = document.createElement('textarea');
    textarea.value = code;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    alert('Code copied to clipboard!');
}

function toggleOutput() {
    const outputBlocks = document.querySelectorAll('.output-block');
    outputBlocks.forEach(block => {
        if (block.style.display === 'none') {
            block.style.display = 'block';
        } else {
            block.style.display = 'none';
        }
    });
}

let lastScrollY = window.scrollY;
        const header = document.querySelector('.header_container');

        window.addEventListener('scroll', () => {
            if (window.scrollY > lastScrollY) {
                // Scrolling down
                header.classList.add('header-hidden');
            } else {
                // Scrolling up
                header.classList.remove('header-hidden');
            }
            lastScrollY = window.scrollY;
        });
window.addEventListener('resize', adjustContentMargin);

document.getElementById('sidebar-menu').addEventListener('click', function(event) {
    if (event.target.tagName === 'A') {
        event.preventDefault();
        const index = event.target.getAttribute('data-index');
        displayContent(topicsData, parseInt(index));
    }
});

