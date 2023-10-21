from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://myuser:mypassword@db:5432/mydatabase'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class Column(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    tasks = db.relationship('Task', backref='column', lazy=True)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    column_id = db.Column(db.Integer, db.ForeignKey('column.id'), nullable=False)
    task_index = db.Column(db.Integer, nullable=False)

@app.route('/')
def index():
    return jsonify({"message": "The backend server is alive!"})

@app.route('/initdb', methods=['GET'])
def initdb():
    db.create_all()
    for title in ["Up Next", "For Review", "Completed"]:
        db.session.add(Column(title=title))
    db.session.commit()
    return jsonify({"message": "Database initialized!"})

@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify([{
        "id": column.id,
        "title": column.title,
        "tasks": [{"id": task.id, "title": task.title, "task_index": task.task_index} for task in column.tasks]
    } for column in Column.query.all()])

@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.json
    title = data.get('title')
    column_id = data.get('column_id', 1)
    if not title: return jsonify({"error": "Title is required"}), 400
    last_task = Task.query.filter_by(column_id=column_id).order_by(Task.task_index.desc()).first()
    task_index = last_task.task_index + 1 if last_task else 1
    new_task = Task(title=title, column_id=column_id, task_index=task_index)
    db.session.add(new_task)
    db.session.commit()
    return jsonify({"message": "Task added successfully", "task_id": new_task.id}), 201

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task: return jsonify({"message": "Task not found!"}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted successfully!"})

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    task_to_move = Task.query.get(task_id)
    if not task_to_move: return jsonify({"message": "Task not found!"}), 404
    new_column_id = data['column_id']
    new_task_index = data['task_index']

    # Taskの移動先が異なるカラムの場合、移動元カラム内の影響するタスクのindexを1減少させる
    if task_to_move.column_id != new_column_id:
        for task in Task.query.filter(Task.column_id == task_to_move.column_id, Task.task_index > task_to_move.task_index):
            task.task_index -= 1
    # 移動先のカラムにおいて、移動したタスクに伴い、影響するタスクのindexを1増加させる
    for task in Task.query.filter(Task.column_id == new_column_id, Task.task_index >= new_task_index):
        task.task_index += 1
    # 移動したタスクのカラムIDとtask_indexを更新
    task_to_move.column_id, task_to_move.task_index = new_column_id, new_task_index

    db.session.commit()
    return jsonify({"message": "Task moved successfully!"})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
