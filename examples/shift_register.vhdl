library ieee;
  use ieee.std_logic_1164.all;

entity shift_register is
  port(
    clk : in std_logic;
    reset : in std_logic;
    incr : in std_logic;
    buttons : in std_logic_vector(3 downto 0);
    leds : out std_logic_vector(3 downto 0)
  );
end entity;


architecture scratch of shift_register is

  constant button_tab_c : positive := 1;

  signal button_d : std_logic;


begin

  process(clk)
  begin
    if rising_edge(clk) then
      if reset = '1' then
        button_d <= '0';
        leds <= "0000";
      else
        if incr = '1' then
          button_d <= buttons(0);
          -- Could use "leds'high-1" as upper bound here
          leds <= leds(2 downto 0) & (buttons(0) and not button_d);
        end if;
      end if;
    end if;
  end process;

end architecture;