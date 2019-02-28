const path = require('url');
const req = require('./lib/req');

const CONFIG = {
  "registry": "http://mockadmin.of.sogou/mock/"
}

module.exports.setRegistry = (registry) => {
  CONFIG.registry = registry;
}

module.exports.listProject = async function (projectID) {
  let url = path.resolve(CONFIG.registry, 'project/list.php');
  let result = await req({
    url,
    qs: {
      projectID: projectID,
      owner: false
    }
  });
  if (result && result.code === 1 &&
    result.data && result.data.list &&
    result.data.list.length) {
    return result.data.list;
  }
  return [];
}

module.exports.checkProject = async function (projectID) {
  let list = await this.listProject(projectID);
  return list && list.length > 0 ? list[list.length - 1] : null;
}

/**
 * 复制一个新的项目
 * @param {String} projectID 原项目标识
 * @param {String} newProject 新项目标识
 * @returns {Object} 返回值，1表示成功；-1表示复制失败；-2 原项目不存在；-3 新项目已存在；-8: 参数异常
 */
module.exports.copyProject = async function (projectID, newProject, username = 'shushanfx') {
  if (!projectID || !newProject) {
    return {
      code: -8,
      message: '传入参数不能为空'
    };
  }
  let project = await this.checkProject(projectID);
  if (!project) {
    return {
      code: -2,
      message: `[${projectID}]不存在`
    };
  }
  let newPro = await this.checkProject(newProject);
  if (newPro) {
    return {
      code: -2,
      message: `[${newProject}]已经存在`,
      data: newPro
    };
  }
  let id = project._id;
  let name = project.name;
  let url = path.resolve(CONFIG.registry, 'project/copy.php');
  let result = await req({
    url,
    method: 'post',
    form: {
      name: `${name}_${newProject}`,
      projectID: newProject,
      _id: id
    }
  });
  if (result && result.code === 1 && result.data) {
    let oldBean = result.data;
    let bean = {
      _id: oldBean._id,
      name: oldBean.name,
      creator: username,
      follows: oldBean.follows && oldBean.follows.length ? [...oldBean.follows, username] : [username]
    };
    let saveResult = await this.saveProject(bean);

    return {
      code: 1,
      message: "复制成功",
      data: saveResult
    }
  }
  return {
    code: -1,
    message: "复制失败"
  };
}

/**
 * 根据projectID检索当前mock列表。
 * @param {String} projectID 项目标识
 * @returns {Array} 检索出来的mock列表
 */
module.exports.listMock = async function (projectID) {
  let url = path.resolve(CONFIG.registry, 'be/list.php');
  let result = await req({
    url,
    qs: {
      projectID,
      pageSize: 1000
    }
  });
  if (result && result.code && result.data && result.data.list && result.data.list.length) {
    return result.data.list;
  }
  return [];
}

/**
 * 保存Mock信息，
 * @param {Object} bean
 * @param {String} [bean._id] mock的内部id
 * @param {String} [bean.proxy] 代理信息
 * @returns {Boolean} 保存是否成功，true表示成功，false表示失败
 */
module.exports.saveMock = async function (bean) {
  let url = path.resolve(CONFIG.registry, 'be/save.php');
  let result = await req({
    url,
    method: 'put',
    json: bean
  });
  if (result && result.code === 1) {
    return true;
  }
  return false;
}

/**
 * 保存Mock信息，
 * @param {Object} bean
 * @param {String} [bean._id] mock的内部id
 * @param {String} [bean.proxy] 代理信息
 * @returns {Boolean} 保存是否成功，true表示成功，false表示失败
 */
module.exports.saveProject = async function (bean) {
  let url = path.resolve(CONFIG.registry, 'project/save.php');
  let result = await req({
    url,
    method: 'put',
    json: bean
  });
  if (result && result.code === 1) {
    return true;
  }
  return false;
}