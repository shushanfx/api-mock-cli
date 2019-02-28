const Index = require('../index');

let projectID = "somy-wap-basic-dev";

test("A test", async () => {
  let project = await Index.checkProject(projectID);
  console.info(project);
  expect(project).not.toBeNull();
  expect(project.projectID).toBe(projectID);
})