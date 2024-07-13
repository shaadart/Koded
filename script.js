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

    topic.content.forEach(section => {
        const subsection = document.createElement('h3');
        subsection.textContent = section.subsection;
        topicElement.appendChild(subsection);

        const description = document.createElement('p');
        description.textContent = section.description;
        topicElement.appendChild(description);

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

            pre.appendChild(copyButton); // Append the copy button inside the pre element at the top
            pre.appendChild(code);
            codeBlock.appendChild(pre);

            topicElement.appendChild(codeBlock);
        }

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
    mcqs.forEach((question, qIdx) => {
        const selectedOption = document.querySelector(`input[name="mcq-${topicIndex}-${qIdx}"]:checked`);
        const resultElement = document.createElement('div');
        resultElement.classList.add('mcq-result');

        if (selectedOption) {
            if (selectedOption.value === question.answer) {
                resultElement.textContent = 'Correct!';
                resultElement.style.color = 'green';
            } else {
                resultElement.textContent = `Incorrect! The correct answer is: ${question.answer}`;
                resultElement.style.color = 'red';
            }
        } else {
            resultElement.textContent = `Please select an answer. The correct answer is: ${question.answer}`;
            resultElement.style.color = 'orange';
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

window.addEventListener('resize', adjustContentMargin);

document.getElementById('sidebar-menu').addEventListener('click', function(event) {
    if (event.target.tagName === 'A') {
        event.preventDefault();
        const index = event.target.getAttribute('data-index');
        displayContent(topicsData, parseInt(index));
    }
});
