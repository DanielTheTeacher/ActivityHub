import sys

file_path = r"c:/Users/Danie/Documents/Development/Activity Hub V2/games/imposter.html"

with open(file_path, "r", encoding="utf-8", newline="") as f:
    content = f.read()

start_marker = "                results.data.forEach((row) => {"
end_marker = "                    if (label && vocabStr) {"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    pass
else:
    new_block = r"""                results.data.forEach((originalRow) => {
                    let row = {};
                    for (let key in originalRow) {
                        if (originalRow.hasOwnProperty(key)) {
                            row[key.trim().toLowerCase()] = originalRow[key];
                        }
                    }

                    let label = '';
                    let vocabStr = '';
                    
                    if (type === 'Textbook') {
                        if (row['sidebar vocabulary'] && row['text title']) {
                            let page = row['page number'] || '?';
                            let ch = row['chapter'] || '?';
                            label = \`\${row['text title']} (Page \${page}, ch. \${ch})\`;
                            vocabStr = row['sidebar vocabulary'];
                        }
                    } else if (type === 'Set') {
                        if (row['vocabulary'] && row['set name']) {
                            label = row['set name'];
                            vocabStr = row['vocabulary'];
                        }
                    }
                    
"""
    if '\r\n' in content:
        # replace any \n with \r\n to match windows original file if necessary
        # wait, python's raw string has \n, we replace it
        new_block = new_block.replace('\r\n', '\n').replace('\n', '\r\n')
        
    new_content = content[:start_idx] + new_block + content[end_idx:]

    with open(file_path, "w", encoding="utf-8", newline="") as f:
        f.write(new_content)
