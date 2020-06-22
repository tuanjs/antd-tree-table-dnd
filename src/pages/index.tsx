import React, { useState, useRef, useCallback } from 'react';
import styles from './index.css';
import { DndProvider, useDrop, useDrag, DragSourceMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'antd/dist/antd.css';
import { Row, Col, Table } from 'antd';
import { v4 as uuidv4 } from 'uuid';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
];

const ItemTypes = {
  DragableBodyRow: 'DragableBodyRow',
}

const SourceBodyRow = ({ record, moveRow, className, style, ...restProps }) => {
  const ref = useRef();
  const [{ isDragging }, drag] = useDrag({
    item: { record, type: ItemTypes.DragableBodyRow },
    end: (item: {} | undefined, monitor: DragSourceMonitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        moveRow(item.record);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drag(ref);
  const opacity = isDragging ? 0.4 : 1;

  return (
    <tr
      ref={ref}
      style={{ cursor: 'move', ...style, opacity }}
      {...restProps}
    />
  );
};

const TargetBodyRow = ({ record, addRow, className, style, ...restProps }) => {
  const ref = useRef();
  const [{ isOver, canDrop, dropClassName }, drop] = useDrop({
    accept: ItemTypes.DragableBodyRow,
    drop: item => {
      addRow(item.record, record);
    },
    collect: (monitor) => {
      return {
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        dropClassName: ' drop-over',
      };
    },
  });
  drop(ref);
  const isActive = canDrop && isOver;
  return (
    <tr
      ref={ref}
      className={`${className}${isActive ? dropClassName : ''}`}
      style={{ cursor: 'move', ...style }}
      {...restProps}
    />
  );
};

const DndTreeTable: React.FC = () => {

  const [sourceData, setSourceData] = useState([
    {
      key: uuidv4(),
      name: 'Source John Brown sr.',
      age: 60,
      address: 'New York No. 1 Lake Park',
      children: [
        {
          key: uuidv4(),
          name: 'Source John Brown',
          age: 42,
          address: 'New York No. 2 Lake Park',
        },
        {
          key: uuidv4(),
          name: 'Source John Brown jr.',
          age: 30,
          address: 'New York No. 3 Lake Park',
          children: [
            {
              key: uuidv4(),
              name: 'Source Jimmy Brown',
              age: 16,
              address: 'New York No. 3 Lake Park',
            },
          ],
        },
        {
          key: uuidv4(),
          name: 'Source Jim Green sr.',
          age: 72,
          address: 'London No. 1 Lake Park',
          children: [
            {
              key: uuidv4(),
              name: 'Source Jim Green',
              age: 42,
              address: 'London No. 2 Lake Park',
              children: [
                {
                  key: uuidv4(),
                  name: 'Source Jim Green jr.',
                  age: 25,
                  address: 'London No. 3 Lake Park',
                },
                {
                  key: uuidv4(),
                  name: 'Source Jimmy Green sr.',
                  age: 18,
                  address: 'London No. 4 Lake Park',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      key: uuidv4(),
      name: 'Source Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
      children: [
        {
          key: uuidv4(),
          name: 'Source Joe Black jr.',
          age: 25,
          address: 'London No. 3 Lake Park',
        },
      ],
    },
  ]);
  const [targetData, setTargetData] = useState([
    {
      key: uuidv4(),
      name: 'Target John Brown sr.',
      age: 60,
      address: 'New York No. 1 Lake Park',
      children: [
        {
          key: uuidv4(),
          name: 'Target John Brown',
          age: 42,
          address: 'New York No. 2 Lake Park',
        },
        {
          key: uuidv4(),
          name: 'Target John Brown jr.',
          age: 30,
          address: 'New York No. 3 Lake Park',
          children: [
            {
              key: uuidv4(),
              name: 'Target Jimmy Brown',
              age: 16,
              address: 'New York No. 3 Lake Park',
            },
          ],
        },
        {
          key: uuidv4(),
          name: 'Target Jim Green sr.',
          age: 72,
          address: 'London No. 1 Lake Park',
          children: [
            {
              key: uuidv4(),
              name: 'Target Jim Green',
              age: 42,
              address: 'London No. 2 Lake Park',
              children: [
                {
                  key: uuidv4(),
                  name: 'Target Jim Green jr.',
                  age: 25,
                  address: 'London No. 3 Lake Park',
                },
                {
                  key: uuidv4(),
                  name: 'Target Jimmy Green sr.',
                  age: 18,
                  address: 'London No. 4 Lake Park',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      key: uuidv4(),
      name: 'Target Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
      children: [
        {
          key: uuidv4(),
          name: 'Target Joe Black jr.',
          age: 25,
          address: 'London No. 3 Lake Park',
        },
      ],
    },
  ]);

  const expandable = {
    expandRowByClick: true,
    defaultExpandAllRows: true,
  }

  const sourceTreeUpdate = useCallback((root, rootIdx, roots, key) => {
    if (root.key === key) {
      roots.splice(rootIdx, 1);
      return;
    } else if (root.children && root.children.length) {
      root.children.forEach((node, nodeIdx, nodes) => {
        if (node.key === key) {
          nodes.splice(nodeIdx, 1);
          return;
        } else {
          sourceTreeUpdate(node, nodeIdx, nodes, key);
        }
      });
    }
  })

  const moveRow = useCallback(
    (record) => {
      sourceData.forEach((root, rootIdx, roots) => {
        sourceTreeUpdate(root, rootIdx, roots, record.key);
      });
      let diffData = [];
      if (sourceData.length) {
        diffData = [...sourceData];
      }
      setSourceData(diffData);
    },
    [sourceData, sourceTreeUpdate],
  );

  const targetTreeUpdate = useCallback((root, record, key) => {
    if (root.key === key) {
      if (root.children && root.children.length) { } else {
        root.children = []
      }
      root.children.push(record);
      return;
    }
    if (root.children && root.children.length) {
      root.children.forEach((node) => {
        if (node.key === key) {
          if (node.children && node.children.length) { } else {
            node.children = [];
          }
          node.children.push(record);
          return;
        } else {
          targetTreeUpdate(node, record, key);
        }
      });
    }
  })

  const addRow = useCallback(
    (dragRecord, hoverRecord) => {
      targetData.forEach((root) => {
        targetTreeUpdate(root, dragRecord, hoverRecord.key);
      });
      setTargetData(targetData);
    },
    [targetData, targetTreeUpdate],
  );

  return (
    <div className={styles.normal}>
      <Row gutter={24}>
        <DndProvider backend={HTML5Backend}>
          <Col span={12}>
            <h2>Drag From Source</h2>
            <Table
              rowKey="key"
              columns={columns}
              dataSource={sourceData}
              expandable={expandable}
              components={{
                body: {
                  row: SourceBodyRow,
                },
              }}
              onRow={(record) => ({
                record,
                moveRow,
              })}
            />
          </Col>
          <Col span={12}>
            <h2>Drop To Target</h2>
            <Table
              rowKey="key"
              columns={columns}
              dataSource={targetData}
              expandable={expandable}
              components={{
                body: {
                  row: TargetBodyRow,
                },
              }}
              onRow={(record) => ({
                record,
                addRow,
              })}
            />
          </Col>
        </DndProvider>
      </Row>
    </div>
  );
}

export default DndTreeTable;
