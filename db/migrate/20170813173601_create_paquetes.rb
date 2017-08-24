class CreatePaquetes < ActiveRecord::Migration[5.1]
  def change
    create_table :paquetes do |t|
      t.string :nombre
      t.string :tipo
      t.string :descripcion
      t.references :pet, foreign_key: true

      t.timestamps
    end
  end
end
