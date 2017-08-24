class CreateEventos < ActiveRecord::Migration[5.1]
  def change
    create_table :eventos do |t|
      t.string :nombre
      t.datetime :fecha
      t.string :descripcion

      t.timestamps
    end
  end
end
