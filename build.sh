#!/bin/bash

function build_yui() {
    cat $(list_scripts) | sed 's/singleScript = false/singleScript = true/g' > webgram.unified.js
    java -jar $1 -o webgram.min.js webgram.unified.js
    rm webgram.unified.js
}

function build_jsmin() {
    cat $(list_scripts) | sed 's/singleScript = false/singleScript = true/g' | $1 > webgram.min.js
}

function build_cat() {
    cat $(list_scripts) | sed 's/singleScript = false/singleScript = true/g' > webgram.min.js
}

function list_scripts() {
    echo "webgram/webgram.js"
    grep -E "^\s+'[a-zA-Z0-9_/-]+\.js',\s*$" webgram/webgram.js | tr -d "', " | grep -v 'debug.js' | sed 's/^/webgram\//g'
}

function print_help() {
    echo "Usage: $0 <method> [program_path]"
    echo "    using the YUI compressor: $0 yui /path/to/yuicompressor-x.y.z.jar"
    echo "    using the jsmin minifier: $0 jsmin /path/to/jsmin"
    echo "    using file concatenation: $0 cat"
}

if [ -z "$1" ]; then
    print_help
    exit -1
fi

method=$1

if [ ${method} == "yui" ]; then
    if [ -z "$2" ]; then
	print_help
	exit -1
    fi
    
    echo "Using the YUI compressor..."
    build_yui "$2"

elif [ ${method} == "jsmin" ]; then
    if [ -z "$2" ]; then
	print_help
	exit -1
    fi
    
    echo "Using the jsmin minifier..."
    build_jsmin "$2"

elif [ ${method} == "cat" ]; then
    echo "Using simple file concatenation..."
    build_cat

else
    print_help
    exit -1
fi

echo 'The file "webgram.min.js" is ready.'
