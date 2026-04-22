import sqlite3
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# --- CONFIGURACIÓN DE BASE DE DATOS ---
def init_db():
    conn = sqlite3.connect('citas.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pacientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mascota TEXT NOT NULL,
            propietario TEXT NOT NULL,
            especie TEXT NOT NULL,
            fecha TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Inicializar DB al arrancar
init_db()

def get_db_connection():
    conn = sqlite3.connect('citas.db')
    conn.row_factory = sqlite3.Row
    return conn

# --- RUTAS ---

# 1. Agenda: Mostrar todas las citas 
@app.route('/')
def index():
    conn = get_db_connection()
    citas = conn.execute('SELECT * FROM pacientes').fetchall()
    conn.close()
    return render_template('index.html', citas=citas)

# 2. Agendar: Registrar nueva cita #
@app.route('/agendar', methods=['GET', 'POST'])
def agendar():
    if request.method == 'POST':
        mascota = request.form['mascota']
        propietario = request.form['propietario']
        especie = request.form['especie']
        fecha = request.form['fecha']

        conn = get_db_connection()
        conn.execute('INSERT INTO pacientes (mascota, propietario, especie, fecha) VALUES (?, ?, ?, ?)',
                     (mascota, propietario, especie, fecha))
        conn.commit()
        conn.close()
        return redirect(url_for('index'))
    return render_template('agendar.html')

# 3. Modificar: Editar cita existente
@app.route('/editar/<int:id>', methods=['GET', 'POST'])
def editar(id):
    conn = get_db_connection()
    cita = conn.execute('SELECT * FROM pacientes WHERE id = ?', (id,)).fetchone()

    if request.method == 'POST':
        mascota = request.form['mascota']
        propietario = request.form['propietario']
        especie = request.form['especie']
        fecha = request.form['fecha']

        conn.execute('UPDATE pacientes SET mascota = ?, propietario = ?, especie = ?, fecha = ? WHERE id = ?',
                     (mascota, propietario, especie, fecha, id))
        conn.commit()
        conn.close()
        return redirect(url_for('index'))

    conn.close()
    return render_template('editar.html', cita=cita)

# 4. Cancelar: Eliminar cita 
@app.route('/cancelar/<int:id>')
def cancelar(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM pacientes WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, port=5001) 
