#!/usr/bin/env node

const program = require('commander');
const pkg = require('../package.json');
const Index = require('../index.js');
const ora = require('ora');

const debug = (msg) => {
  if (program.verbose) {
    console.info('[debug] ' + msg);
  }
}

// program
//   .command('copy [src] [dst]', "从某个projectID复制一个新的项目")
//   .action(async function (action, src, dst) {
//     if (action !== 'copy') {
//       return;
//     }
//     if (!src || !dst) {
//       console.error('原projectID和新projectID必须同时提供！');
//       process.exit(1);
//     }
//     PARAMETER.action = 'copy';
//     PARAMETER.src = src;
//     PARAMETER.dst = dst;
//     return true;
//   })

// program
//   .command('set projectID', "按照projectID批量设置projectID的值。")
//   .option('--host', "设置代理的host")
//   .option('--proxy', "设置代理的port")
//   .option('--tag', "匹配的tag标签，多个使用，分隔")
//   .action(async function (action, projectID, options) {
//     if (action !== 'set') {
//       return;
//     }
//     if (!projectID) {
//       console.error('projectID必须提供！')
//       process.exit(1);
//       return
//     }
//     PARAMETER.action = 'set';
//     PARAMETER.projectID = projectID;
//     Object.assign(PARAMETER, options);
//     return true;
//   });

program
  .version(pkg.version)
  .name(pkg.name)
  .option('--action [action]', "执行的操作，copy、set、delete", "copy")
  .option('-r, --registry [registry]', '配置中心的地址，默认http://mockadmin.of.sogou/mock/')
  .option('-v, --verbose', "是否运行详情")
  .option('--host [host]', "设置代理的host")
  .option('--port [port]', "设置代理的port")
  .option('--tag [tag]', "匹配的tag标签，多个使用，分隔")
  .option('--id [projectID]', "操作的项目")
  .option('--to [newProjectID]', "新的项目标识，复制时使用.")
  .on("option:registry", function () {
    if (this.registry) {
      debug(`配置registry为：${this.registry}`);
      Index.setRegistry(this.registry);
    }
  })
program.parse(process.argv);

(async function () {
  if (program.action) {
    switch (program.action) {
      case 'copy':
        let spinner = ora("正在配置mock信息").start();
        let result = await Index.copyProject(program.id, program.to);
        switch (result.code) {
          case 1:
            spinner.succeed(result.message);
            break;
          case -1:
          case -2:
          case -3:
            spinner.fail(result.message);
            break;
          default:
            spinner.warn(result.message);
            spinner.stop();
        }
        break;
      case 'set':
        let list = await Index.listMock(program.id);
        let port = program.port;
        let host = program.host;
        let tag = program.tag || '';

        if (list && list.length && port && host) {
          let spinner = ora("正在配置mock信息");
          if (program.verbose) {
            spinner.info(`共检索到配置${list.length}项`);
          }
          list = list.filter(item => {
            if (item.isProxy && typeof item.description === 'string' &&
              item.description.indexOf(tag) !== -1) {
              return true;
            }
            return false;
          })
          if (program.verbose) {
            spinner.info(`共匹配配置${list.length}项目`);
          }
          for (let i = 0; i < list.length; i++) {
            let item = list[i];
            let bean = {
              _id: item._id,
              name: item.name,
              proxy: `${host}:${port}`
            }
            let ret = await Index.saveMock(bean);
            spinner.info(`修改配置${i + 1} -> ${ret ? '成功' : '失败'}`);
          }
          spinner.succeed(`共修改配置${list.length}项`);
        } else {
          console.warn('根据当前的projectID未找到相应的配置');
        }
        break;
    }
  } else {
    program.help();
  }
})();

// console.info(program);