#!/bin/bash

function list_scripts() {
    echo "lib/webgram.js"
    grep -E "^\s+'[a-zA-Z0-9_/-]+\.js',\s*$" lib/webgram.js | tr -d "', " | grep -v 'debug.js' | sed 's/^/lib\//g'
}

function encode_images() {
    regex="^(.+)Webgram.jsPath \+ '(images\/[a-zA-Z\-]+\.png)'(.+)\$"
    while IFS= read -r line; do
        if [[ "${line}" =~ ${regex} ]]; then
            encoded="data:image/png;base64,$(base64 -w 0 "lib/${BASH_REMATCH[2]}")"
            echo "${BASH_REMATCH[1]}'${encoded}'${BASH_REMATCH[3]}"
            echo "${line}" >> /tmp/out.txt
        else
            echo "${line}"
        fi
    done
}

function unify() {
    cat $(list_scripts) | sed 's/_singleScript = false/_singleScript = true/g' | encode_images
}

function build_yui() {
    unify | java -jar $1 --type js > webgram.min.js
}

function build_jsmin() {
    unify | $1 > webgram.min.js
}

function build_cat() {
    unify > webgram.min.js
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
