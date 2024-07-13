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

    topic.content.forEach(section => {
        const subsection = document.createElement('h3');
        subsection.textContent = section.subsection;
        topicElement.appendChild(subsection);

        const description = document.createElement('p');
        description.textContent = section.description;
        topicElement.appendChild(description);

        if (section.code) {
            const codeBlock = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = section.code.content.join('\n');
            codeBlock.appendChild(code);
            topicElement.appendChild(codeBlock);
        }

        if (section.list) {
            const list = document.createElement('ul');
            section.list.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = item;
                list.appendChild(listItem);
            });
            topicElement.appendChild(list);
        }
    });

    contentContainer.appendChild(topicElement);

    // Highlight active sidebar item
    const sidebarItems = document.querySelectorAll('.sidebar nav ul li');
    sidebarItems.forEach((item, idx) => {
        item.classList.remove('active');
        if (idx === index) {
            item.classList.add('active');
        }
    });

    // Add navigation buttons
    const navigationContainer = document.createElement('div');
    navigationContainer.classList.add('navigation');

    // Previous button
    if (index > 0) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => {
            displayContent(topics, index - 1);
        });
        navigationContainer.appendChild(prevButton);
    }

    // Next button
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

    // Optionally, provide feedback to the user
    alert('Code copied to clipboard!');
}
// Adjust content margin on window resize
window.addEventListener('resize', adjustContentMargin);

// Sidebar item click event
document.getElementById('sidebar-menu').addEventListener('click', function(event) {
    if (event.target.tagName === 'A') {
        event.preventDefault();
        const index = event.target.getAttribute('data-index');
        displayContent(topicsData, parseInt(index));
    }
});
