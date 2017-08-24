class CreateRespuesta < ActiveRecord::Migration[5.1]
  def change
    create_table :respuesta do |t|
      t.string :nombre
      t.string :correo
      t.string :descripcion
      t.references :comentario, foreign_key: true

      t.timestamps
    end
  end
end
