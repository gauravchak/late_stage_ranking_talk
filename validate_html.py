from html.parser import HTMLParser

class HTMLValidator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags_stack = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        # We don't stack self-closing tags
        self_closing = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
                        'link', 'meta', 'param', 'source', 'track', 'wbr']
        if tag not in self_closing:
            self.tags_stack.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        self_closing = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
                        'link', 'meta', 'param', 'source', 'track', 'wbr']
        if tag in self_closing:
            return
            
        if not self.tags_stack:
            self.errors.append(f"Unexpected closing tag </{tag}> at line {self.getpos()[0]}, col {self.getpos()[1]}")
            return
            
        expected_tag, pos = self.tags_stack.pop()
        if expected_tag != tag:
            self.errors.append(f"Mismatch: Expected </{expected_tag}> (opened at line {pos[0]}, col {pos[1]}), but found </{tag}> at line {self.getpos()[0]}, col {self.getpos()[1]}")
            # Put expected tag back to attempt recovery
            self.tags_stack.append((expected_tag, pos))

if __name__ == '__main__':
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    parser = HTMLValidator()
    parser.feed(content)
    
    print(f"Validation completed. Errors found: {len(parser.errors)}")
    for err in parser.errors:
        print(err)
        
    if parser.tags_stack:
        print("\nUnclosed tags left in stack:")
        for tag, pos in reversed(parser.tags_stack):
            print(f"<{tag}> opened at line {pos[0]}, col {pos[1]}")
