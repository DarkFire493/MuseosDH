class CreateHorarios < ActiveRecord::Migration[5.1]
  def change
    create_table :horarios do |t|
      t.string :dia
      t.time :horai
      t.time :horaf
      t.references :pet, foreign_key: true

      t.timestamps
    end
  end
end
