/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

const execSync = require("child_process").execSync;

const execute = cmd => execSync(cmd, {stdio: "inherit"});

function docker(image = "emsdk") {
    console.log(`-- Creating ${image} docker image`);
    let cmd = "docker run --rm -it";
    if (process.env.PSP_CPU_COUNT) {
        cmd += ` --cpus="${parseInt(process.env.PSP_CPU_COUNT)}.0"`;
    }
    cmd += ` -v $(pwd):/usr/src/app/python -w /usr/src/app/python perspective/${image}`;
    return cmd;
}

// Copy .so in place to perspective package
try {
    let cmd1 = "cp `find build -name 'libbinding.*'` python/perspective/table/";
    let cmd2 = "cp `find build -name 'libpsp.*'` python/perspective/table/";
    if (process.env.PSP_DOCKER) {
        execute(docker("python") + ' bash -c "' + cmd1 + '"');
        execute(docker("python") + ' bash -c "' + cmd2 + '"');
    } else {
        execute(cmd1);
        execute(cmd2);
    }
} catch (e) {
    process.exit(1);
}

try {
    let cmd = "cd python && python3 -m nose2 -v perspective --with-coverage --coverage=perspective";
    if (process.env.PSP_DOCKER) {
        execute(docker("python") + ' bash -c "' + cmd + '"');
    } else {
        execute(cmd);
    }
} catch (e) {
    console.log(e.message);
    process.exit(1);
}
