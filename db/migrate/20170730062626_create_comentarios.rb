class CreateComentarios < ActiveRecord::Migration[5.1]
  def change
    create_table :comentarios do |t|
      t.string :nombre
      t.string :correo
      t.string :comentario

      t.timestamps
    end
  end
end
