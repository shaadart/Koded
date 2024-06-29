
// script.js

fetch('data.json')
  .then(response => response.json())
  .then(data => {
    displayContent(data.topics);
  })
  .catch(error => console.error('Error fetching JSON data:', error));

function displayContent(topics) {
    const contentContainer = document.getElementById('content-container');
    const sidebarMenu = document.getElementById('sidebar-menu');

    topics.forEach((topic, index) => {
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

        // Add to sidebar
        const sidebarItem = document.createElement('li');
        const sidebarLink = document.createElement('a');
        sidebarLink.href = `#topic-${index}`;
        sidebarLink.textContent = topic.title;
        sidebarItem.appendChild(sidebarLink);
        sidebarMenu.appendChild(sidebarItem);

        topicElement.id = `topic-${index}`;
    });
}