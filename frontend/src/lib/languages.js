// Languages supported by the code-execution engine, plus starter templates for the
// playground (raw mode = complete standalone programs that read their own stdin).

export const LANGUAGES = [
    { label: 'Java',    monaco: 'java',       ext: 'java' },
    { label: 'Python',  monaco: 'python',     ext: 'py' },
    { label: 'C++',     monaco: 'cpp',        ext: 'cpp' },
    { label: 'C',       monaco: 'c',          ext: 'c' },
    { label: 'Node.js', monaco: 'javascript', ext: 'js' },
];

export const langByLabel = (label) => LANGUAGES.find((l) => l.label === label) || LANGUAGES[0];

// NOTE for Java: the runner compiles the file as Main.java, so the public class MUST be `Main`.
export const RAW_TEMPLATES = {
    Java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Hello, World!");
    }
}`,
    Python: `import sys

def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()`,
    'C++': `#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    C: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
    'Node.js': `process.stdin.resume();
process.stdin.setEncoding('utf8');

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
    console.log('Hello, World!');
});`,
};
