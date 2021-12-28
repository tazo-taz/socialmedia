const { _QUERY, _QUERY_ONE, DB } = require('../DB/default');

async function SORT_FUNC({ SORT, OLD_SORT, WHERE = 1, TABLE, SORT_NAME = 'SORT' }) {
  if (SORT > OLD_SORT)
    await _QUERY(
      `UPDATE ${TABLE} SET ${SORT_NAME} = ${SORT_NAME} - 1 WHERE ${WHERE} AND ${SORT_NAME} > ${OLD_SORT} AND ${SORT_NAME} <= ${SORT}`,
    );
  if (SORT < OLD_SORT)
    await _QUERY(
      `UPDATE ${TABLE} SET ${SORT_NAME} = ${SORT_NAME} + 1 WHERE ${WHERE} AND ${SORT_NAME} < ${OLD_SORT} AND ${SORT_NAME} >= ${SORT}`,
    );
}

async function DELETE_AND_SORT({ TABLE, WHERE = 1, UID, SORT_NAME = 'SORT', uidName = 'UID' }) {
  const { [SORT_NAME]: SORT } = await SELECT_ONE_BY({
    TABLE,
    WHERE: `${uidName} = ${UID}`,
  });
  await DELETE_AND_SORT_WO_SORT({ TABLE, WHERE, SORT, UID, SORT_NAME });
}

async function DELETE_AND_SORT_WO_SORT({ TABLE, WHERE = 1, SORT, UID, SORT_NAME = 'SORT' }) {
  await _QUERY(`UPDATE ${TABLE} SET ${SORT_NAME} = ${SORT_NAME} - 1 WHERE ${WHERE} AND ${SORT_NAME} > ${SORT} `);
  await DELETE({ TABLE, UID });
}

async function ON_CREATE_SORT({ TABLE, WHERE = 1, SORT, SORT_NAME = 'SORT' }) {
  await _QUERY(`UPDATE ${TABLE} SET ${SORT_NAME} = ${SORT_NAME} + 1 WHERE ${WHERE} AND ${SORT_NAME} >= ${SORT}`);
}

async function INSERT({ TABLE, DATA }) {
  const sql = `INSERT INTO ${TABLE} SET ?`;
  return new Promise((resolve, reject) => {
    DB().query(sql, DATA, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

async function UPDATE({ TABLE, WHERE = 1, DATA }) {
  const paramKeys = Object.keys(DATA)
    .map((a, b, c) => {
      return a + ' = ?' + (c.length == b + 1 ? '' : ',');
    })
    .join(' ');

  const paramValues = Object.values(DATA);

  return new Promise((resolve, reject) => {
    DB().query(`UPDATE ${TABLE} SET ${paramKeys} WHERE ${WHERE}`, paramValues, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

async function DELETE({ TABLE, UID }) {
  await DELETE_BY({ TABLE, WHERE: `UID = ${UID}` });
}

async function deleteAndReturn({ table, uid }) {
  const item = await SELECT_ONE({ TABLE: table, UID: uid });
  await DELETE_BY({ TABLE: table, WHERE: `UID = ${uid}` });
  return item;
}

async function DELETE_BY({ TABLE, WHERE }) {
  await _QUERY(`DELETE FROM ${TABLE} WHERE ${WHERE}`);
}

async function SELECT_ONE({ TABLE, UID }) {
  return await SELECT_ONE_BY({ TABLE, WHERE: `uid = ${UID}` });
}

async function SELECT_ONE_BY({ TABLE, WHERE = 1 }) {
  return await _QUERY_ONE(`SELECT * FROM ${TABLE} WHERE ${WHERE}`);
}

async function SELECT({ TABLE, WHERE = 1, ORDER = 1 }) {
  return await _QUERY(`SELECT * FROM ${TABLE} WHERE ${WHERE} ORDER BY ${ORDER}`);
}

async function LAST_UID({ TABLE }) {
  return (await _QUERY_ONE(`SELECT UID FROM ${TABLE} ORDER BY UID DESC LIMIT 1`)).UID;
}

async function CREATE_AND_SORT({ TABLE, WHERE, SORT_NAME = 'SORT', DATA }) {
  await ON_CREATE_SORT({
    TABLE,
    WHERE,
    SORT: DATA[SORT_NAME],
    SORT_NAME,
  });
  await INSERT({
    TABLE,
    DATA,
  });
}

async function UPDATE_AND_SORT({ SORT, OLD_SORT, SORT_WHERE, UPDATE_WHERE, SORT_NAME = 'SORT', TABLE, DATA }) {
  await SORT_FUNC({
    SORT,
    OLD_SORT,
    WHERE: SORT_WHERE,
    TABLE,
    SORT_NAME,
  });

  await UPDATE({
    TABLE,
    WHERE: UPDATE_WHERE,
    DATA,
  });
}

async function COUNT({ TABLE, WHERE = `1` }) {
  return (await _QUERY_ONE(`SELECT COUNT(*) FROM ${TABLE} WHERE ${WHERE}`))['COUNT(*)'];
}

module.exports = {
  SORT_FUNC,
  ON_CREATE_SORT,
  INSERT,
  DELETE,
  SELECT_ONE,
  SELECT,
  UPDATE,
  DELETE_BY,
  LAST_UID,
  CREATE_AND_SORT,
  UPDATE_AND_SORT,
  DELETE_AND_SORT,
  DELETE_AND_SORT_WO_SORT,
  SELECT_ONE_BY,
  COUNT,
  deleteAndReturn,
};
